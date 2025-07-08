import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { IMovieMngController } from '../controllers/interface/movieMng.controller.interface';

const movieMngController = container.resolve<IMovieMngController>('MovieMngController');

const router = Router();

// Movie Management Routes
router.get('/fetch', (req, res) => movieMngController.fetchMoviesUser(req, res));

router.get('/find/:id', (req, res) => movieMngController.findMovieById(req, res));

router.post('/rate', verifyAccessToken, (req, res) => movieMngController.submitRating(req, res));

router.post('/like', verifyAccessToken, (req, res) => movieMngController.submitRating(req, res));

router.patch('/like', verifyAccessToken, authorizeRoles(['user']), (req, res) =>
  movieMngController.likeOrUnlikeMovie(req, res),
);

router.get('/isLiked/:movieId', verifyAccessToken, (req, res) =>
  movieMngController.isMovieLiked(req, res),
);

export default router;
