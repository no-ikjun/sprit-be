import { BookInfoDto } from 'src/book/dto/book.dto';
import { Book } from '../entities/book.entity';

export type LoginResponseType = {
  access_token: string;
  new_user: boolean;
};

export type BookRegisterResponseType = {
  new_book: boolean;
  book_data: Book;
};

export type BookSearchResponseType = {
  is_end: boolean;
  books: BookInfoDto[];
};

export type BannerRegisterResponseType = {
  message: string;
};
