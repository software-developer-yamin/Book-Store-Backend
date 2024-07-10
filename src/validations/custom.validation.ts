/**
 * Custom validator function for password validation.
 * @param value - The password value to be validated.
 * @param helpers - Joi helpers object for error handling.
 * @returns The validated password value if it meets the criteria.
 */
import Joi from 'joi';

export const password: Joi.CustomValidator<string> = (value, helpers) => {
  if (value.length < 8) {
    return helpers.error('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.error('password must contain at least 1 letter and 1 number');
  }
  return value;
};
