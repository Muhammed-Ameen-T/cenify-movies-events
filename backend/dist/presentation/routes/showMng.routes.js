"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const show_validation_1 = require("../validation/show.validation");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const ShowMngController = tsyringe_1.container.resolve('ShowManagementController');
const router = (0, express_1.Router)();
// Fetch all shows
router.get('/fetch', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin', 'user']), ShowMngController.getAllShows.bind(ShowMngController));
// Fetch shows for a vendor
router.get('/fetch-vendor', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), ShowMngController.getShowsOfVendor.bind(ShowMngController));
// Fetch a show by ID
router.get('/find/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin', 'user']), ShowMngController.getShowById.bind(ShowMngController));
// Create a new show
router.post('/create', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin']), (0, validate_middleware_1.validateRequest)(show_validation_1.CreateShowSchema), ShowMngController.createShow.bind(ShowMngController));
// Update an existing show
router.put('/update/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin']), 
// validateRequest(UpdateShowSchema),
ShowMngController.updateShow.bind(ShowMngController));
// Update show status
router.patch('/status/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin']), 
// validateRequest(UpdateShowStatusSchema),
ShowMngController.updateShowStatus.bind(ShowMngController));
// Delete a show
router.delete('/delete/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'admin']), ShowMngController.deleteShow.bind(ShowMngController));
// Fetch Show Selection
router.get('/selection/:movieId', 
// verifyAccessToken,
ShowMngController.getShowSelection.bind(ShowMngController));
// Create Reccuring Shows
router.post('/recurring', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor']), (req, res, next) => ShowMngController.createRecurringShow(req, res, next));
exports.default = router;
