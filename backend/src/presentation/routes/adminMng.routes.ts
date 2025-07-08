import { Router } from 'express';
import 'reflect-metadata';
import '../../infrastructure/container';
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
router.get('/users', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  userMngController.getUsers(req, res),
);

router.patch('/users/block/:id', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  userMngController.updateUserBlockStatus(req, res),
);


// Movie Management Routes
router.get('/fetch-movies', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  movieMngController.fetchMovies(req, res),
);

router.post('/create-movie', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  movieMngController.createMovie(req, res),
);

router.put('/edit-movie', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  movieMngController.updateMovie(req, res),
);

router.patch('/movie-status', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  movieMngController.updateMovieStatus(req, res),
);

router.get('/get-movie/:id', verifyAccessToken, authorizeRoles(['admin']), (req, res) =>
  movieMngController.findMovieById(req, res),
);

export default router;