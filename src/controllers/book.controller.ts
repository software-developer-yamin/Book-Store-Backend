/**
 * Defines functions for creating, getting, updating, and deleting books asynchronously.
 * Utilizes catchAsync for error handling and http-status for status code constants.
 * Uses bookService for CRUD operations on books, pick for filtering query parameters, and ApiError for custom errors.
 */

import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { bookService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

const createBook = catchAsync(async (req, res) => {
  const { title, author_id, published_date, description } = req.body;
  const book = await bookService.createBook(title, author_id, published_date, description);
  res.status(httpStatus.CREATED).send(book);
});

const getBooks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'author_id']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await bookService.queryBooks(filter, options);
  res.send(result);
});

const getBook = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.bookId);
  if (!book) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found');
  }
  res.send(book);
});

const updateBook = catchAsync(async (req, res) => {
  const book = await bookService.updateBookById(req.params.bookId, req.body);
  res.send(book);
});

const deleteBook = catchAsync(async (req, res) => {
  await bookService.deleteBookById(req.params.bookId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getBooksByAuthor = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await bookService.queryBooks({ author_id: req.params.authorId }, options);
  res.send(result);
});

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBooksByAuthor
};
