import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { VerifyOtpSchema, SendOtpSchema } from '../validation/userAuth.validation';
import { IUserManagementController } from '../controllers/interface/userMng.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { IMovieMngController } from '../controllers/interface/movieMng.controller.interface';

const userMngController = container.resolve<IUserManagementController>('UserManagementController');
const movieMngController = container.resolve<IMovieMngController>('MovieMngController');

const router = Router();

// User Management Routes
router.get('/users', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  userMngController.getUsers(req, res, next),
);

router.patch('/users/block/:id', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  userMngController.updateUserBlockStatus(req, res, next),
);

// Movie Management Routes
router.get('/fetch-movies', verifyAccessToken, authorizeRoles(['admin', 'vendor']),(req, res, next) =>
  movieMngController.fetchMovies(req, res, next),
);

router.get('/fetch-movies-user',(req, res, next) => movieMngController.fetchMoviesUser(req, res, next));

router.post('/create-movie', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  movieMngController.createMovie(req, res, next),
);

router.put('/edit-movie', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  movieMngController.updateMovie(req, res, next),
);

router.patch('/movie-status', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  movieMngController.updateMovieStatus(req, res, next),
);

router.get('/get-movie/:id', verifyAccessToken, authorizeRoles(['admin']),(req, res, next) =>
  movieMngController.findMovieById(req, res, next),
);

export default router;
