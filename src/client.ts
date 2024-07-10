/**
 * Initializes a Knex instance based on the environment configuration.
 * If the environment is 'production', uses the 'production' configuration from the knexfile;
 * otherwise, uses the 'development' configuration.
 * @returns {Knex} The Knex instance configured for the current environment.
 */

import Knex from 'knex';
import config from './config/config';
import knexFile from '../knexfile';

const knex = Knex(knexFile[config.env === 'production' ? 'production' : 'development']);

export default knex;
