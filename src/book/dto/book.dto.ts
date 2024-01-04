import { IsString } from 'class-validator';

export class NewBookDto {
  @IsString()
  isbn: string;

  @IsString()
  title: string;

  @IsString()
  authors: string;

  @IsString()
  publisher: string;

  @IsString()
  translators: string;

  @IsString()
  search_url: string;

  @IsString()
  thumbnail: string;

  @IsString()
  content: string;

  @IsString()
  datetime: string;
}

export class BookInfoDto {
  authors: string[];
  contents: string;
  datetime: string;
  isbn: string;
  price: number;
  publisher: string;
  sale_price: number;
  status: string;
  thumbnail: string;
  title: string;
  translators: string[];
  url: string;
  constructor(data: any) {
    this.authors = data.authors;
    this.contents = data.contents;
    this.datetime = data.datetime;
    this.isbn = data.isbn;
    this.price = data.price;
    this.publisher = data.publisher;
    this.sale_price = data.sale_price;
    this.status = data.status;
    this.thumbnail = data.thumbnail;
    this.title = data.title;
    this.translators = data.translators;
    this.url = data.url;
  }
}
