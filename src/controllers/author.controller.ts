/**
 * Defines functions for creating, getting, updating, and deleting authors asynchronously.
 * Utilizes catchAsync for error handling and httpStatus for status codes.
 */

import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authorService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

const createAuthor = catchAsync(async (req, res) => {
  const { name, birth_date, bio } = req.body;
  const author = await authorService.createAuthor(name, birth_date, bio);
  res.status(httpStatus.CREATED).send(author);
});

const getAuthors = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'birth_date']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await authorService.queryAuthors(filter, options);
  res.send(result);
});

const getAuthor = catchAsync(async (req, res) => {
  const author = await authorService.getAuthorById(req.params.authorId);
  if (!author) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Author not found');
  }
  res.send(author);
});

const updateAuthor = catchAsync(async (req, res) => {
  const author = await authorService.updateAuthorById(req.params.authorId, req.body);
  res.send(author);
});

const deleteAuthor = catchAsync(async (req, res) => {
  await authorService.deleteAuthorById(req.params.authorId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createAuthor,
  getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor
};
