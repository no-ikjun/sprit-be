import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as multer from 'multer';
import { Injectable, Req, Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/global/entities/profile.entity';
import { User } from 'src/global/entities/user.entity';
import { Repository } from 'typeorm';
import { Book } from 'src/global/entities/book.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_recommend_book.entity';
import { ProfileResponseType } from 'src/global/types/response.type';
import { ProfileRepository } from './profile.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepositories: ProfileRepository,
    private readonly userService: UserService,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(ProfileRecommendBook)
    private profileRecommendBookRepository: Repository<ProfileRecommendBook>,
  ) {}

  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  upload = multer({ dest: 'uploads/' }).single('upload');

  async fileUpload(@Req() req, @Res() res) {
    this.upload(req, res, async (error) => {
      if (error) {
        console.log(error);
        return res.status(404).json(`이미지 업로드에 실패했습니다: ${error}`);
      }

      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      const fileStream = fs.createReadStream(filePath);

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `profiles/${Date.now().toString()}_${req.file.originalname}`,
        Body: fileStream,
        ContentType: req.file.mimetype,
      };

      try {
        const upload = new Upload({
          client: this.s3,
          params: uploadParams,
        });

        const result = await upload.done();
        const image = result.Location.split('amazonaws.com/')[1];
        const access_token = req.headers.authorization.split(' ')[1];
        const user_info = await this.userService.getUserInfo(access_token);
        await this.profileRepositories.updateProfileImage(
          user_info.user_uuid,
          image,
        );
        res.status(201).json({ image });
      } catch (uploadError) {
        console.error(uploadError);
        res.status(500).json('파일 업로드에 실패했습니다.');
      } finally {
        // 임시로 저장된 파일 삭제
        fs.unlinkSync(filePath);
      }
    });
  }

  async setProfile(
    user_uuid: string,
    image: string,
    description: string,
    recommend_book_ids: string[] = [],
  ): Promise<Profile> {
    // 1. User가 존재하는지 확인
    const user = await this.userRepository.findOne({ where: { user_uuid } });
    if (!user) {
      throw new Error(`User with user_uuid ${user_uuid} not found`);
    }

    // 2. 프로필이 이미 존재하는지 확인
    let profile = await this.profileRepository.findOne({
      where: { user: { user_uuid } },
      relations: ['user', 'recommend_list'],
    });

    if (!profile) {
      // 3. 프로필이 존재하지 않으면 새로 생성
      profile = new Profile();
      profile.user = user;
    }

    // 4. 프로필 정보 업데이트 (이미지와 자기소개)
    profile.image = image || profile.image; // 이미지가 주어지지 않으면 기존 값을 유지
    profile.description = description;

    // 5. 추천 도서 리스트 처리
    if (recommend_book_ids.length > 0) {
      // 추천 도서 리스트가 제공되었을 때만 처리
      const books = await this.bookRepository.findByIds(recommend_book_ids);
      const profileRecommendBooks = books.map((book, index) => {
        const recommendBook = new ProfileRecommendBook();
        recommendBook.book = book;
        recommendBook.profile = profile;
        recommendBook.rank = index + 1; // 순위를 부여
        return recommendBook;
      });

      // 추천 도서 리스트를 저장
      profile.recommend_list = await this.profileRecommendBookRepository.save(
        profileRecommendBooks,
      );
    } else {
      // 추천 도서가 없는 경우 빈 배열로 초기화
      profile.recommend_list = [];
    }

    // 6. 프로필 저장
    return await this.profileRepository.save(profile);
  }

  async getProfile(user_uuid: string): Promise<ProfileResponseType> {
    const profile = await this.profileRepository.findOne({
      where: { user: { user_uuid } },
      relations: ['user', 'recommend_list'],
    });

    if (!profile) {
      console.log("Profile doesn't exist. Creating a new profile...");
      const user = await this.userRepository.findOne({ where: { user_uuid } });
      if (!user) {
        throw new Error(`User with user_uuid ${user_uuid} not found`);
      } else {
        this.setProfile(user_uuid, 'profiles/default.png', user.user_nickname);
      }
      return {
        user_uuid,
        nickname: user.user_nickname,
        image: 'profiles/default.png',
        description: '',
        recommend_list: [],
      };
    }
    return {
      user_uuid: profile.user.user_uuid,
      nickname: profile.user.user_nickname,
      image: profile.image,
      description: profile.description,
      recommend_list: profile.recommend_list.map((recommendBook) => {
        return recommendBook.book.book_uuid;
      }),
    };
  }
}
