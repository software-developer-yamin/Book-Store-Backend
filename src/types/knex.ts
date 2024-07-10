export type Author = {
  id: number;
  name: string;
  bio: string | null;
  birth_date: Date;
  created_at: Date;
  updated_at: Date;
};

export type Book = {
  id: number;
  title: string;
  description: string | null;
  published_date: Date;
  author_id: number;
  created_at: Date;
  updated_at: Date;
};

export type User = {
  id: number;
  email: string;
  name: string | null;
  password: string;
  role: 'USER' | 'ADMIN';
  is_email_verified: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Token = {
  id: number;
  token: string;
  type: 'ACCESS' | 'REFRESH' | 'RESET_PASSWORD' | 'VERIFY_EMAIL';
  expires: Date;
  blacklisted: boolean;
  created_at: Date;
  user_id: number;
};

declare module 'knex/types/tables' {
  interface Tables {
    authors: Author;
    books: Book;
    users: User;
    tokens: Token;
  }
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL'
}
