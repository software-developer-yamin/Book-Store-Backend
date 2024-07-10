/**
 * Contains functions for user authentication and authorization.
 * Includes login, logout, token refresh, password reset, and email verification operations.
 * Each function handles specific user actions and throws ApiError with appropriate status codes for errors.
 */

import httpStatus from 'http-status';
import tokenService from './token.service';
import userService from './user.service';
import ApiError from '../utils/ApiError';
import { encryptPassword, isPasswordMatch } from '../utils/encryption';
import { AuthTokensResponse } from '../types/response';
import exclude from '../utils/exclude';
import knex from '../client';
import { TokenType, User } from '../types/knex';

/**
 * Logs in a user with the provided email and password.
 * @param email - The email of the user to log in.
 * @param password - The password of the user to log in.
 * @returns A Promise that resolves with the user object excluding the password field if login is successful.
 * @throws {ApiError} When the email or password is incorrect, with status code 401 (UNAUTHORIZED).
 */
const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<Omit<User, 'password'>> => {
  const user = await userService.getUserByEmail(email, [
    'id',
    'email',
    'name',
    'password',
    'role',
    'is_email_verified',
    'created_at',
    'updated_at'
  ]);
  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return exclude(user, ['password']);
};

/**
 * Logs out a user by deleting the refresh token from the database.
 * @param {string} refreshToken - The refresh token to be used for logging out the user.
 * @returns {Promise<void>} - A promise that resolves once the refresh token is successfully deleted.
 * @throws {ApiError} - If the refresh token is not found in the database.
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await knex('tokens')
    .where({
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false
    })
    .first();
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await knex('tokens').where({ id: refreshTokenData.id }).del();
};

/**
 * Refreshes the authentication tokens using the provided refresh token.
 * @param {string} refreshToken - The refresh token used to generate new authentication tokens.
 * @returns {Promise<AuthTokensResponse>} A promise that resolves to an object containing new access and refresh tokens.
 * @throws {ApiError} Throws an error with status code UNAUTHORIZED if the refresh token is invalid or expired.
 */
const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const { user_id } = refreshTokenData;
    await knex('tokens').where({ id: refreshTokenData.id }).del();
    return tokenService.generateAuthTokens({ id: user_id });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset the password for a user using the provided reset password token and new password.
 * @param resetPasswordToken The token used to verify the password reset request.
 * @param newPassword The new password to set for the user.
 * @returns Promise<void>
 * @throws ApiError when the password reset fails or user is not found.
 */
const resetPassword = async (resetPasswordToken: string, newPassword: string): Promise<void> => {
  try {
    const resetPasswordTokenData = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenData.user_id);
    if (!user) {
      throw new Error();
    }
    const encryptedPassword = await encryptPassword(newPassword);
    await userService.updateUserById(user.id, { password: encryptedPassword });
    await knex('tokens').where({ user_id: user.id, type: TokenType.RESET_PASSWORD }).del();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify the email of a user using the provided verification token.
 * @param verifyEmailToken The verification token to verify the user's email.
 * @returns A Promise that resolves once the email is successfully verified.
 * @throws ApiError when the email verification fails.
 */
const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
  try {
    const verifyEmailTokenData = await tokenService.verifyToken(
      verifyEmailToken,
      TokenType.VERIFY_EMAIL
    );
    await knex('tokens')
      .where({ user_id: verifyEmailTokenData.user_id, type: TokenType.VERIFY_EMAIL })
      .del();
    await userService.updateUserById(verifyEmailTokenData.user_id, { is_email_verified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

export default {
  loginUserWithEmailAndPassword,
  isPasswordMatch,
  encryptPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail
};
