/**
 * Defines Joi validation schemas for creating, getting, updating, and deleting authors.
 */

import Joi from 'joi';

const createAuthor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    bio: Joi.string().optional(),
    birth_date: Joi.date().required()
  })
};

const getAuthors = {
  query: Joi.object().keys({
    name: Joi.string(),
    birth_date: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getAuthor = {
  params: Joi.object().keys({
    authorId: Joi.number().integer()
  })
};

const updateAuthor = {
  params: Joi.object().keys({
    authorId: Joi.number().integer()
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      birth_date: Joi.date(),
      bio: Joi.string()
    })
    .min(1)
};

const deleteAuthor = {
  params: Joi.object().keys({
    authorId: Joi.number().integer()
  })
};

export default {
  createAuthor,
  getAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor
};
