"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/http/routes/seatSelection.routes.ts
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
const seatSelectionController = tsyringe_1.container.resolve('SeatSelectionController');
router.get('/:showId', (req, res, next) => seatSelectionController.getSeatSelection(req, res, next));
router.post('/:showId/select', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user']), (req, res, next) => seatSelectionController.selectSeats(req, res, next));
exports.default = router;
