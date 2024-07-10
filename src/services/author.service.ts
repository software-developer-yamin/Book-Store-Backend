/**
 * This code snippet exports functions related to author operations such as creating, querying, updating, and deleting authors.
 * It includes functions to get an author by name and birth date, create a new author, query authors based on filters, get an author by ID,
 * update an author by ID, and delete an author by ID. These functions interact with a database using Knex queries and handle errors using ApiError.
 */

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import knex from '../client';
import { Author } from '../types/knex';

/**
 * Retrieves an author by their name and birth date from the database.
 * @param name - The name of the author to search for.
 * @param birth_date - The birth date of the author to search for.
 * @param keys - Optional. The keys of the author object to retrieve. Defaults to ['id', 'name', 'birth_date', 'bio', 'created_at', 'updated_at'].
 * @returns A promise that resolves to the author object with specified keys, or null if not found.
 */
const getAuthorByNameAndBirthDate = async <Key extends keyof Author>(
  name: string,
  birth_date: Date,
  keys: Key[] = ['id', 'name', 'birth_date', 'bio', 'created_at', 'updated_at'] as Key[]
): Promise<Pick<Author, Key> | null> => {
  const author = await knex('authors').where({ name, birth_date }).select(keys).first();
  return author as Promise<Pick<Author, Key> | null>;
};

/**
 * Creates a new author with the provided name, birth date, and optional bio.
 * @param name The name of the author.
 * @param birth_date The birth date of the author.
 * @param bio Optional bio information about the author.
 * @returns A Promise that resolves to the created Author object.
 * @throws ApiError with status code 400 if an author with the same name and birth date already exists.
 */
const createAuthor = async (name: string, birth_date: Date, bio?: string): Promise<Author> => {
  if (await getAuthorByNameAndBirthDate(name, birth_date)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name & Birth Date already taken');
  }
  const [author] = await knex('authors')
    .insert({
      name,
      birth_date,
      bio
    })
    .returning('*');
  return author;
};

/**
 * Queries authors from the database based on the provided filter and options.
 * @param filter - The filter object to apply to the query.
 * @param options - Additional options for the query like limit, page, and sortBy.
 * @param keys - The keys to select from the Author type. Defaults to all keys.
 * @returns A Promise that resolves to an array of objects containing selected keys from the Author type.
 */
const queryAuthors = async <Key extends keyof Author>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
  },
  keys: Key[] = ['id', 'name', 'birth_date', 'bio', 'created_at', 'updated_at'] as Key[]
): Promise<Pick<Author, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;

  let query = knex('authors')
    .where(filter)
    .select(keys)
    .offset((page - 1) * limit)
    .limit(limit);

  if (sortBy) {
    const [field, order] = sortBy.split(':');
    query = query.orderBy(field, order as 'asc' | 'desc');
  }

  const authors = await query;
  return authors as Pick<Author, Key>[];
};

/**
 * Retrieves an author by their ID from the database.
 * @param id - The ID of the author to retrieve.
 * @param keys - Optional. An array of keys to select from the author object. Defaults to ['id', 'name', 'birth_date', 'bio', 'created_at', 'updated_at'].
 * @returns A promise that resolves to the author object with only the specified keys, or null if the author is not found.
 */
const getAuthorById = async <Key extends keyof Author>(
  id: number,
  keys: Key[] = ['id', 'name', 'birth_date', 'bio', 'created_at', 'updated_at'] as Key[]
): Promise<Pick<Author, Key> | null> => {
  const author = await knex('authors').where({ id }).select(keys).first();
  return author as Promise<Pick<Author, Key> | null>;
};

/**
 * Updates an author by their ID with the provided update body.
 * @param authorId The ID of the author to update.
 * @param updateBody The partial data to update for the author.
 * @param keys The keys of the author object to return after update.
 * @returns A Promise that resolves to the updated author object with specified keys, or null if author is not found.
 * @throws ApiError with status NOT_FOUND if author is not found.
 * @throws ApiError with status BAD_REQUEST if the provided name and birth date combination is already taken.
 */
const updateAuthorById = async <Key extends keyof Author>(
  authorId: number,
  updateBody: Partial<Author>,
  keys: Key[] = ['id', 'name', 'birth_date', 'bio'] as Key[]
): Promise<Pick<Author, Key> | null> => {
  const author = await getAuthorById(authorId, keys);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  if (
    updateBody.name &&
    updateBody.birth_date &&
    (await getAuthorByNameAndBirthDate(updateBody.name, updateBody.birth_date))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name & Birth Date already taken');
  }
  const [updatedAuthor] = await knex('authors')
    .where({ id: authorId })
    .update(updateBody)
    .returning(keys);
  return updatedAuthor as Pick<Author, Key> | null;
};

/**
 * Deletes an author by their ID.
 * @param authorId The ID of the author to delete.
 * @returns A Promise that resolves to the deleted author.
 * @throws ApiError when the author is not found.
 */
const deleteAuthorById = async (authorId: number): Promise<Author> => {
  const author = await getAuthorById(authorId);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  await knex('authors').where({ id: author.id }).del();
  return author;
};

export default {
  createAuthor,
  queryAuthors,
  getAuthorById,
  updateAuthorById,
  deleteAuthorById
};
