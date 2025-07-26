"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWithdrawService = void 0;
// services/stripeTransfer.service.ts
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../config/env.config");
const stripe = new stripe_1.default(env_config_1.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
/**
 * Transfers a specified amount to a vendor's Stripe account.
 *
 * @param {string} stripeAccountId - The ID of the vendor's Stripe Connect account.
 * @param {number} amount - The amount to transfer in INR.
 * @returns {Promise<Stripe.Transfer>} The Stripe Transfer object.
 */
const StripeWithdrawService = async (stripeAccountId, amount) => {
    return stripe.transfers.create({
        amount: amount * 100,
        currency: 'inr',
        destination: stripeAccountId,
        transfer_group: `Vendor_${stripeAccountId}`,
    });
};
exports.StripeWithdrawService = StripeWithdrawService;
