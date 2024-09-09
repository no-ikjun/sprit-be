import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookService } from 'src/book/book.service';
import { Book } from 'src/global/entities/book.entity';
import { Profile } from 'src/global/entities/profile.entity';
import { ProfileRecommendBook } from 'src/global/entities/profile_book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly bookService: BookService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ProfileRecommendBook)
    private readonly profileRecommendBookRepository: Repository<ProfileRecommendBook>,
  ) {}

  async getProfileByUserUuid(user_uuid: string): Promise<Profile> {
    return await this.profileRepository.findOne({
      where: { user: { user_uuid } },
      relations: ['user'],
    });
  }

  async updateProfileImage(
    user_uuid: string,
    imageUrl: string,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserUuid(user_uuid);

    if (!profile) {
      throw new Error(`Profile for user with user_uuid ${user_uuid} not found`);
    }

    profile.image = imageUrl;

    return await this.profileRepository.save(profile);
  }

  async updateProfileDescription(
    user_uuid: string,
    description: string,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserUuid(user_uuid);

    if (!profile) {
      throw new Error(`Profile for user with user_uuid ${user_uuid} not found`);
    }

    profile.description = description;

    return await this.profileRepository.save(profile);
  }

  async updateProfileRecommendList(
    user_uuid: string,
    recommend_book_ids: string[],
  ): Promise<Profile> {
    // 1. 해당 유저의 프로필을 찾습니다.
    const profile = await this.profileRepository.findOne({
      where: { user: { user_uuid } },
      relations: ['user', 'recommend_list'],
    });

    if (!profile) {
      throw new Error(`Profile for user with user_uuid ${user_uuid} not found`);
    }

    // 2. 추천 도서 리스트 초기화
    profile.recommend_list = [];

    // 3. 추천 도서 리스트 업데이트
    const profileRecommendBooks = [];
    for (let i = 0; i < recommend_book_ids.length; i++) {
      const recommend_book_uuid = recommend_book_ids[i];

      // 책 정보를 하나씩 찾습니다.
      const book = await this.bookService.findByBookUuid(recommend_book_uuid);
      if (!book) {
        throw new Error(`Book with book_uuid ${recommend_book_uuid} not found`);
      }

      // 추천 도서 순위 및 정보 설정
      const recommendBook = new ProfileRecommendBook();
      const bookInfo = new Book();
      bookInfo.book_uuid = book.book_uuid;
      bookInfo.isbn = book.isbn;
      bookInfo.title = book.title;
      bookInfo.authors = book.authors;
      bookInfo.publisher = book.publisher;
      bookInfo.translators = book.translators;
      bookInfo.search_url = book.search_url;
      bookInfo.thumbnail = book.thumbnail;
      bookInfo.content = book.content;
      bookInfo.published_at = book.published_at;
      bookInfo.updated_at = book.updated_at;
      bookInfo.score = book.score;

      recommendBook.book = bookInfo;
      recommendBook.profile = profile;
      recommendBook.rank = i + 1; // 순위를 부여

      profileRecommendBooks.push(recommendBook);
    }

    // 4. 추천 도서 리스트를 저장
    profile.recommend_list = await this.profileRecommendBookRepository.save(
      profileRecommendBooks,
    );

    // 5. 수정된 프로필 저장
    return await this.profileRepository.save(profile);
  }
}
