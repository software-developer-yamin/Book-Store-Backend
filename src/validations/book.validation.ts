/**
 * Defines Joi validation schemas for creating, getting, updating, and deleting books.
 */
import Joi from 'joi';

const createBook = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    author_id: Joi.number().integer().required(),
    published_date: Joi.date().required(),
    description: Joi.string().optional()
  })
};

const getBooks = {
  query: Joi.object().keys({
    title: Joi.string(),
    author_id: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getBook = {
  params: Joi.object().keys({
    bookId: Joi.number().integer()
  })
};

const updateBook = {
  params: Joi.object().keys({
    bookId: Joi.number().integer()
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      author_id: Joi.number().integer(),
      published_date: Joi.date(),
      description: Joi.string()
    })
    .min(1)
};

const deleteBook = {
  params: Joi.object().keys({
    bookId: Joi.number().integer()
  })
};

const getBooksByAuthor = {
  params: Joi.object().keys({
    authorId: Joi.number().integer()
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

export default {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBooksByAuthor
};
