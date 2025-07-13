"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const screen_validation_1 = require("../validation/screen.validation");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const ScreenMngController = tsyringe_1.container.resolve('ScreenManagementController');
const router = (0, express_1.Router)();
// Fetch screens for a vendor
router.get('/fetch', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), ScreenMngController.getScreensOfVendor.bind(ScreenMngController));
// Create a new screen
router.post('/create', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (0, validate_middleware_1.validateRequest)(screen_validation_1.CreateScreenSchema), ScreenMngController.createScreen.bind(ScreenMngController));
// Update an existing screen
router.put('/update/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (0, validate_middleware_1.validateRequest)(screen_validation_1.UpdateScreenSchema), ScreenMngController.updateScreen.bind(ScreenMngController));
exports.default = router;
