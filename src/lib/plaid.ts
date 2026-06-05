import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

let _client: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (_client) return _client;

  const env = process.env.PLAID_ENV || 'sandbox';
  const baseUrl =
    env === 'production'
      ? PlaidEnvironments.production
      : env === 'development'
      ? PlaidEnvironments.development
      : PlaidEnvironments.sandbox;

  const config = new Configuration({
    basePath: baseUrl,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
        'PLAID-SECRET': process.env.PLAID_SECRET!,
      },
    },
  });

  _client = new PlaidApi(config);
  return _client;
}
