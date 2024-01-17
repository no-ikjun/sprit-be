import { Module } from '@nestjs/common';
import { BookLibraryController } from './book_library.controller';
import { BookLibraryService } from './book_library.service';
import { BookLibraryRepository } from './book_library.repository';

@Module({
  controllers: [BookLibraryController],
  providers: [BookLibraryService, BookLibraryRepository],
})
export class BookLibraryModule {}
