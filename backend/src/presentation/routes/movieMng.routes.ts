import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { IMovieMngController } from '../controllers/interface/movieMng.controller.interface';

const movieMngController = container.resolve<IMovieMngController>('MovieMngController');

const router = Router();

// Movie Management Routes
router.get('/fetch', (req, res, next) => movieMngController.fetchMoviesUser(req, res, next));

router.get('/find/:id', (req, res, next) => movieMngController.findMovieById(req, res, next));

router.post('/rate', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  movieMngController.submitRating(req, res, next),
);

router.post('/like', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  movieMngController.submitRating(req, res, next),
);

router.patch('/like', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  movieMngController.likeOrUnlikeMovie(req, res, next),
);

router.get('/isLiked/:movieId', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  movieMngController.isMovieLiked(req, res, next),
);

export default router;
