/**
 * This code snippet exports functions related to generating, saving, verifying tokens,
 * and generating authentication tokens, reset password tokens, and verification email tokens.
 * It includes functions for generating a JWT token, saving a token in the database,
 * verifying the authenticity of a token, generating authentication tokens for a user,
 * generating a reset password token for a user, and generating a verification email token.
 */
import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import config from '../config/config';
import userService from './user.service';
import ApiError from '../utils/ApiError';
import { AuthTokensResponse } from '../types/response';
import knex from '../client';
import { Token, TokenType } from '../types/knex';

/**
 * Generates a JWT token for a given user ID, expiration time, and token type.
 * @param userId The ID of the user for whom the token is being generated.
 * @param expires The expiration time of the token.
 * @param type The type of the token (e.g., ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL).
 * @param secret The secret key used to sign the token. Defaults to the JWT secret from the config.
 * @returns The generated JWT token as a string.
 */
const generateToken = (
  userId: number,
  expires: Moment,
  type: TokenType,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type
  };
  return jwt.sign(payload, secret);
};

/**
 * Saves a token in the database.
 * @param {string} token - The token to be saved.
 * @param {number} userId - The ID of the user associated with the token.
 * @param {Moment} expires - The expiration date and time of the token.
 * @param {TokenType} type - The type of the token (e.g., ACCESS, REFRESH).
 * @param {boolean} [blacklisted=false] - Indicates if the token is blacklisted.
 * @returns {Promise<Token>} The token object that was saved in the database.
 */
const saveToken = async (
  token: string,
  userId: number,
  expires: Moment,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  const [createdToken] = await knex('tokens')
    .insert({
      token,
      user_id: userId,
      expires: expires.toDate(),
      type,
      blacklisted
    })
    .returning('*');
  return createdToken;
};

/**
 * Verify the authenticity of a token by decoding it and checking against the database.
 * @param {string} token - The token to be verified.
 * @param {TokenType} type - The type of the token (ACCESS, REFRESH, RESET_PASSWORD, VERIFY_EMAIL).
 * @returns {Promise<Token>} The token data if verification is successful.
 * @throws {Error} When the token is not found or invalid.
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const userId = Number(payload.sub);
  const tokenData = await knex('tokens')
    .where({ token, type, user_id: userId, blacklisted: false })
    .first();
  if (!tokenData) {
    throw new Error('Token not found');
  }
  return tokenData;
};

/**
 * Generates authentication tokens for a user, including access and refresh tokens.
 *
 * @param user - The user object containing the user's id.
 * @returns A promise that resolves to an object with access and refresh tokens along with their expiration dates.
 */
const generateAuthTokens = async (user: { id: number }): Promise<AuthTokensResponse> => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, TokenType.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, TokenType.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, TokenType.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate()
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate()
    }
  };
};

/**
 * Generates a reset password token for the user with the given email.
 * @param email - The email of the user for whom the reset password token is generated.
 * @returns A Promise that resolves to a string representing the reset password token.
 * @throws ApiError with status code 404 if no user is found with the provided email.
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generates a verification email token for the given user.
 * @param user - The user object containing the user ID.
 * @returns A promise that resolves to the generated verification email token.
 */
const generateVerifyEmailToken = async (user: { id: number }): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
  return verifyEmailToken;
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken
};
