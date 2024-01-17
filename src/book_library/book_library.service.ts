import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BookLibraryRepository } from './book_library.repository';
import { UserService } from 'src/user/user.service';
import { Book } from 'src/global/entities/book.entity';

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
}
