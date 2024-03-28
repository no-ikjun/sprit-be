import { BookInfoDto } from 'src/book/dto/book.dto';
import { Book } from '../entities/book.entity';
import { QuestApply } from '../entities/quest_apply.entity';
import { Quest } from '../entities/quest.entity';

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

export type AppliedQuestResponseType = {
  apply: QuestApply;
  quest: Quest;
};

export type SetFcmTokenResponseType = {
  fcm_token: string;
  agree_uuid: string;
};

export type MessageResponseType = {
  message: string;
};

export type BookMarkType = {
  book_uuid: string;
  thumbnail: string;
  last_page: number;
};

export type BookMarkResponseType = {
  book_marks: BookMarkType[];
  more_available: boolean;
};

export type BookLibraryResponseType = {
  book_uuid: string;
  count: number;
  state: string;
};

export type BookLibraryListResponseType = {
  book_library_list: BookLibraryResponseType[];
  more_available: boolean;
};

export type LibraryPhraseType = {
  phrase_uuid: string;
  book_title: string;
  phrase: string;
};

export type LibraryPhraseTypeV2 = {
  phrase_uuid: string;
  book_title: string;
  book_thumbnail: string;
  phrase: string;
  page: number;
};

export type LibraryPhraseResponseType = {
  library_phrase_list: LibraryPhraseType[];
  more_available: boolean;
};

export type LibraryPhraseResponseTypeV2 = {
  library_phrase_list: LibraryPhraseTypeV2[];
  more_available: boolean;
};

export type BookRecordHistoryType = {
  book_uuid: string;
  goal_achieved: boolean;
  total_time: number;
};

export type BookRecordHistoryTypeV2 = {
  book_uuid: string;
  goal_achieved: boolean;
  total_time: number;
  book_title: string;
  book_thumbnail: string;
  authors: string[];
  publisher: string;
};

export type MonthlyRecordResponseType = {
  present_month: number;
  past_month: number;
};
