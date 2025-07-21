"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const userMngController = tsyringe_1.container.resolve('UserManagementController');
const movieMngController = tsyringe_1.container.resolve('MovieMngController');
const router = (0, express_1.Router)();
// User Management Routes
router.get('/users', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => userMngController.getUsers(req, res, next));
router.patch('/users/block/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => userMngController.updateUserBlockStatus(req, res, next));
// Movie Management Routes
router.get('/fetch-movies', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin', 'vendor']), (req, res, next) => movieMngController.fetchMovies(req, res, next));
router.get('/fetch-movies-user', (req, res, next) => movieMngController.fetchMoviesUser(req, res, next));
router.post('/create-movie', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => movieMngController.createMovie(req, res, next));
router.put('/edit-movie', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => movieMngController.updateMovie(req, res, next));
router.patch('/movie-status', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => movieMngController.updateMovieStatus(req, res, next));
router.get('/get-movie/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), (req, res, next) => movieMngController.findMovieById(req, res, next));
exports.default = router;
