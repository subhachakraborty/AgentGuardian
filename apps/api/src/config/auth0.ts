import { ManagementClient } from 'auth0';
import { env } from './env';

// Auth0 Management Client — used for Token Vault API + Management API
export const auth0Management = new ManagementClient({
  domain: env.AUTH0_DOMAIN,
  clientId: env.AUTH0_M2M_CLIENT_ID,
  clientSecret: env.AUTH0_M2M_CLIENT_SECRET,
});
