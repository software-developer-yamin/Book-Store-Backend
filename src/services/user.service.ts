/**
 * Contains functions for user management such as creating, querying, updating, and deleting users.
 * Functions include createUser, queryUsers, getUserById, getUserByEmail, updateUserById, and deleteUserById.
 */

import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { encryptPassword } from '../utils/encryption';
import knex from '../client';
import { Role, User } from '../types/knex';

/**
 * Creates a new user with the provided email, password, name, and role.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @param {string} [name] - The name of the user (optional).
 * @param {Role} [role=Role.USER] - The role of the user (default is USER).
 * @returns {Promise<User>} The newly created user object.
 * @throws {ApiError} If the email is already taken.
 */
const createUser = async (
  email: string,
  password: string,
  name?: string,
  role: Role = Role.USER
): Promise<User> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const [user] = await knex('users')
    .insert({
      email,
      name,
      password: await encryptPassword(password),
      role
    })
    .returning('*');
  return user;
};

/**
 * Retrieves a list of users based on the provided filter and options.
 * @param filter - The filter object to apply when querying users.
 * @param options - Additional options for the query such as limit, page, sortBy.
 * @param keys - An array of keys to select from the User type.
 * @returns A Promise that resolves to an array of user objects with only the specified keys.
 */
const queryUsers = async <Key extends keyof User>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
  },
  keys: Key[] = [
    'id',
    'email',
    'name',
    'password',
    'role',
    'is_email_verified',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<User, Key>[]> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;

  let query = knex('users')
    .where(filter)
    .select(keys)
    .offset((page - 1) * limit)
    .limit(limit);

  if (sortBy) {
    const [field, order] = sortBy.split(':');
    query = query.orderBy(field, order as 'asc' | 'desc');
  }

  const users = await query;
  return users as Pick<User, Key>[];
};

/**
 * Retrieves a user by their ID from the database.
 * @param id - The ID of the user to retrieve.
 * @param keys - Optional. An array of keys to select from the user object. Defaults to ['id', 'email', 'name', 'password', 'role', 'is_email_verified', 'created_at', 'updated_at'].
 * @returns A Promise that resolves to the user object with only the selected keys, or null if the user is not found.
 */
const getUserById = async <Key extends keyof User>(
  id: number,
  keys: Key[] = [
    'id',
    'email',
    'name',
    'password',
    'role',
    'is_email_verified',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await knex('users').where({ id }).select(keys).first();
  return user as Promise<Pick<User, Key> | null>;
};

/**
 * Retrieves a user from the database by their email address.
 * @param email The email address of the user to retrieve.
 * @param keys The properties to select for the user. Defaults to ['id', 'email', 'name', 'password', 'role', 'is_email_verified', 'created_at', 'updated_at'].
 * @returns A Promise that resolves to the user object with the selected properties, or null if no user is found.
 */
const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = [
    'id',
    'email',
    'name',
    'password',
    'role',
    'is_email_verified',
    'created_at',
    'updated_at'
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await knex('users').where({ email }).select(keys).first();
  return user as Promise<Pick<User, Key> | null>;
};

/**
 * Update a user by their ID with the provided update body.
 * @param userId - The ID of the user to update.
 * @param updateBody - The partial user object containing the fields to update.
 * @param keys - The keys of the user object to return after update (default: ['id', 'email', 'name', 'role']).
 * @returns A promise that resolves to the updated user object with selected keys, or null if user not found.
 * @throws ApiError with status NOT_FOUND if user is not found.
 * @throws ApiError with status BAD_REQUEST if the provided email is already taken.
 */
const updateUserById = async <Key extends keyof User>(
  userId: number,
  updateBody: Partial<User>,
  keys: Key[] = ['id', 'email', 'name', 'role'] as Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId, ['id', 'email', 'name']);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const [updatedUser] = await knex('users')
    .where({ id: userId })
    .update(updateBody)
    .returning(keys);
  return updatedUser as Pick<User, Key> | null;
};

/**
 * Delete a user by their ID.
 * @param {number} userId - The ID of the user to be deleted.
 * @returns {Promise<User>} The deleted user object.
 * @throws {ApiError} If the user is not found.
 */
const deleteUserById = async (userId: number): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await knex('users').where({ id: user.id }).del();
  return user;
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById
};
