import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookLibraryRepository } from './book_library.repository';
import { UserService } from 'src/user/user.service';
import { Book } from 'src/global/entities/book.entity';
import { RegisterLibraryDto } from './dto/book_library.dto';

@Injectable()
export class BookLibraryService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookLibraryRepository: BookLibraryRepository,
    private readonly userService: UserService,
  ) {}

  async getBeforeBookLibraryList(
    access_token: string,
    state: string,
  ): Promise<Book[]> {
    const userInfo = await this.userService.getUserInfo(access_token);
    return await this.dataSource.transaction(
      async (transactionEntityManager) => {
        return await this.bookLibraryRepository.getBookLibraryListByUserUuid(
          transactionEntityManager,
          userInfo.user_uuid,
          state,
        );
      },
    );
  }

  async setBookLibrary(
    access_token: string,
    book_info: RegisterLibraryDto,
  ): Promise<void> {
    const userInfo = await this.userService.getUserInfo(access_token);
    await this.dataSource.transaction(async (transactionEntityManager) => {
      await this.bookLibraryRepository.setBookLibrary(
        transactionEntityManager,
        userInfo.user_uuid,
        book_info.book_uuid,
        book_info.state,
      );
    });
  }
}
