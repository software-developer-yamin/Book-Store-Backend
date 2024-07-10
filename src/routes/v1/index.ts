/**
 * Initializes and configures the router for handling different routes based on the environment.
 * Default routes include authentication, user, author, and book routes.
 * Development routes include documentation route available only in development mode.
 */

import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import authorRoute from './author.route';
import bookRoute from './book.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/authors',
    route: authorRoute
  },
  {
    path: '/books',
    route: bookRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
