// services/stripeTransfer.service.ts
import Stripe from 'stripe';
import { env } from '../../config/env.config';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });

/**
 * Transfers a specified amount to a vendor's Stripe account.
 *
 * @param {string} stripeAccountId - The ID of the vendor's Stripe Connect account.
 * @param {number} amount - The amount to transfer in INR.
 * @returns {Promise<Stripe.Transfer>} The Stripe Transfer object.
 */
export const StripeWithdrawService = async (stripeAccountId: string, amount: number) => {
  return stripe.transfers.create({
    amount: amount * 100,
    currency: 'inr',
    destination: stripeAccountId,
    transfer_group: `Vendor_${stripeAccountId}`,
  });
};
