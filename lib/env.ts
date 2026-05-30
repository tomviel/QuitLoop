/**
 * Validates required environment variables at startup.
 * Call this once at the top of the server entry-point (or in lib files that need it).
 * In development, logs warnings. In production, throws to prevent a broken deployment.
 */

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_SOLO_MONTHLY',
  'STRIPE_PRICE_SOLO_YEARLY',
  'STRIPE_PRICE_COMMUNITY_MONTHLY',
  'STRIPE_PRICE_COMMUNITY_YEARLY',
  'STRIPE_PRICE_ELITE_MONTHLY',
  'STRIPE_PRICE_ELITE_YEARLY',
  'RESEND_API_KEY',
  'CRON_SECRET',
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn(`[env] ⚠️  ${msg}`);
    }
  }
}
