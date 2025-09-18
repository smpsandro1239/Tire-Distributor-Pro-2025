import { stripe } from './client'

export async function createConnectAccount(email: string, country = 'PT') {
  return await stripe.accounts.create({
    type: 'express',
    country,
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

export async function createTransfer(amount: number, destination: string, orderId: string) {
  return await stripe.transfers.create({
    amount,
    currency: 'eur',
    destination,
    metadata: { orderId },
  })
}
