import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as multer from 'multer';
import { Injectable, Req, Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfileService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  upload = multer({ dest: 'uploads/' }).single('upload'); // 파일을 임시로 로컬에 저장

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
        res.status(201).json(result.Location.split('amazonaws.com/')[1]);
      } catch (uploadError) {
        console.error(uploadError);
        res.status(500).json('파일 업로드에 실패했습니다.');
      } finally {
        // 임시로 저장된 파일 삭제
        fs.unlinkSync(filePath);
      }
    });
  }
}
