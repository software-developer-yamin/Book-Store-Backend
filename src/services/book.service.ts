/**
 * This code snippet exports functions for CRUD operations on a Book entity in the database.
 * Functions include creating a new book, querying books with filters, retrieving a book by ID,
 * updating a book, and deleting a book. Each function handles error cases with ApiError.
 */

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import knex from '../client';
import { Book } from '../types/knex';

/**
 * Retrieves a book by its title and author ID from the database.
 * @param title - The title of the book to search for.
 * @param author_id - The ID of the author of the book.
 * @param keys - Optional. An array of keys to select from the book object. Defaults to all keys.
 * @returns A promise that resolves to the book object with selected keys, or null if not found.
 */
const getBookByTitleAndAuthorId = async <Key extends keyof Book>(
  title: string,
  author_id: number,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'published_date',
    'author_id',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<Book, Key> | null> => {
  const book = await knex('books').where({ title, author_id }).select(keys).first();
  return book as Promise<Pick<Book, Key> | null>;
};

/**
 * Creates a new book entry in the database.
 * @param {string} title - The title of the book.
 * @param {number} author_id - The ID of the author of the book.
 * @param {Date} published_date - The published date of the book.
 * @param {string} [description] - The description of the book (optional).
 * @returns {Promise<Book>} The newly created book entry.
 * @throws {ApiError} If the combination of title and author_id already exists.
 */
const createBook = async (
  title: string,
  author_id: number,
  published_date: Date,
  description?: string
): Promise<Book> => {
  if (await getBookByTitleAndAuthorId(title, author_id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Title & Author Id already taken');
  }
  const [book] = await knex('books')
    .insert({
      title,
      author_id,
      published_date,
      description
    })
    .returning('*');
  return book;
};

/**
 * Retrieves a list of books based on the provided filter and options.
 * @param filter - The filter object to apply when querying for books.
 * @param options - Additional options for the query:
 *                  - limit: The maximum number of books to retrieve (default is 10).
 *                  - page: The page number for paginated results (default is 1).
 *                  - sortBy: The field and order to sort the results by (e.g., 'title:asc').
 * @param keys - The keys to select from the Book type (default includes all keys).
 * @returns A Promise that resolves to an array of objects containing the selected keys from the Book type.
 */
const queryBooks = async <Key extends keyof Book>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
  },
  keys: Key[] = [
    'id',
    'title',
    'description',
    'published_date',
    'author_id',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<Book, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;

  let query = knex('books')
    .where(filter)
    .select(keys)
    .offset((page - 1) * limit)
    .limit(limit);

  if (sortBy) {
    const [field, order] = sortBy.split(':');
    query = query.orderBy(field, order as 'asc' | 'desc');
  }

  const books = await query;
  return books as Pick<Book, Key>[];
};

/**
 * Retrieves a book by its ID from the database.
 * @param id - The ID of the book to retrieve.
 * @param keys - An optional array of keys to select from the book object. Defaults to all keys.
 * @returns A promise that resolves to the book object with only the selected keys, or null if not found.
 */
const getBookById = async <Key extends keyof Book>(
  id: number,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'published_date',
    'author_id',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<Book, Key> | null> => {
  const book = await knex('books').where({ id }).select(keys).first();
  return book as Promise<Pick<Book, Key> | null>;
};

/**
 * Update a book by its ID with the provided update body.
 * @param {number} bookId - The ID of the book to update.
 * @param {Partial<Book>} updateBody - The partial data to update the book with.
 * @param {Key[]} [keys] - The keys to select from the book object after updating.
 * @returns {Promise<Pick<Book, Key> | null>} The updated book object or null if not found.
 * @throws {ApiError} If the book is not found or if the title & author ID are already taken.
 */
const updateBookById = async <Key extends keyof Book>(
  bookId: number,
  updateBody: Partial<Book>,
  keys: Key[] = [
    'id',
    'title',
    'description',
    'published_date',
    'author_id',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<Book, Key> | null> => {
  const author = await getBookById(bookId, keys);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  if (
    updateBody.title &&
    updateBody.author_id &&
    (await getBookByTitleAndAuthorId(updateBody.title, updateBody.author_id))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Title & Author Id already taken');
  }
  const [updatedBook] = await knex('books')
    .where({ id: bookId })
    .update(updateBody)
    .returning(keys);
  return updatedBook as Pick<Book, Key> | null;
};

/**
 * Deletes a book by its ID.
 * @param {number} bookId - The ID of the book to delete.
 * @returns {Promise<Book>} A promise that resolves to the deleted book.
 * @throws {ApiError} If the book with the given ID is not found.
 */
const deleteBookById = async (bookId: number): Promise<Book> => {
  const book = await getBookById(bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  await knex('books').where({ id: book.id }).del();
  return book;
};

export default {
  createBook,
  queryBooks,
  getBookById,
  updateBookById,
  deleteBookById
};
