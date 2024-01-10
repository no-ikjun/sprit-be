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

export type BookInfoResponseType = {
  book_uuid: string;
  isbn: string;
  title: string;
  authors: string;
  publisher: string;
  translators: string;
  search_url: string;
  thumbnail: string;
  content: string;
  published_at: Date;
  updated_at: Date;
  score: number;
  star: number;
  star_count: number;
};

export type PopularBookResponseType = {
  books: BookInfoResponseType[];
  more_available: boolean;
};

export type BannerRegisterResponseType = {
  message: string;
};
