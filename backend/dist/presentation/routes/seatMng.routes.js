"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/seatLayout.routes.ts
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const seatLayoutController = tsyringe_1.container.resolve('SeatLayoutController');
const router = (0, express_1.Router)();
router.post('/create-seat-layout', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (req, res, next) => seatLayoutController.createSeatLayout(req, res, next));
router.get('/fetch-seats', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (req, res, next) => seatLayoutController.findSeatLayoutsByVendor(req, res, next));
router.put('/update-seats/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (req, res, next) => seatLayoutController.updateSeatLayout(req, res, next));
router.get('/find-seats/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (req, res, next) => seatLayoutController.findSeatLayoutById(req, res, next));
exports.default = router;
