"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const movieMngController = tsyringe_1.container.resolve('MovieMngController');
const router = (0, express_1.Router)();
// Movie Management Routes
router.get('/fetch', (req, res, next) => movieMngController.fetchMoviesUser(req, res, next));
router.get('/find/:id', (req, res, next) => movieMngController.findMovieById(req, res, next));
router.post('/rate', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user']), (req, res, next) => movieMngController.submitRating(req, res, next));
router.post('/like', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user']), (req, res, next) => movieMngController.submitRating(req, res, next));
router.patch('/like', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user']), (req, res, next) => movieMngController.likeOrUnlikeMovie(req, res, next));
router.get('/isLiked/:movieId', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user']), (req, res, next) => movieMngController.isMovieLiked(req, res, next));
exports.default = router;
