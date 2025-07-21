"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const adminAuthController = tsyringe_1.container.resolve('AdminAuthController');
const router = (0, express_1.Router)();
router.post('/login', adminAuthController.login.bind(adminAuthController));
exports.default = router;
