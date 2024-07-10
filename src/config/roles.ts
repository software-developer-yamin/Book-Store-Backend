import { Role } from '../types/knex';

const allRoles = {
  [Role.USER]: [
    'getUsers',
    'manageUsers',
    'getAuthors',
    'manageAuthors',
    'getBooks',
    'manageBooks'
  ],
  [Role.ADMIN]: []
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
