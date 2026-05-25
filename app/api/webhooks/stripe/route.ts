import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import type { Database } from '@/types/database';
import type Stripe from 'stripe';

// Must read the raw body for Stripe signature verification
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe/webhook] signature error:', msg);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Use service role — webhooks run outside user sessions
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] handler error for ${event.type}:`, err);
    return new NextResponse('Handler error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof createClient<Database>>
) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) return;

  // Look up the Supabase user ID from Stripe customer metadata
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    // Fall back: find user by stripe_customer_id
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();
    if (!sub) return;
  }

  // Retrieve subscription details from Stripe
  const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);
  const priceId = stripeSub.items.data[0]?.price.id;
  const plan = priceIdToPlan(priceId);
  const billingCycle = stripeSub.items.data[0]?.price.recurring?.interval === 'year'
    ? 'yearly'
    : 'monthly';

  const targetUserId = userId ?? (await getUserIdByCustomer(customerId, supabase));
  if (!targetUserId) return;

  await supabase
    .from('subscriptions')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan,
      billing_cycle: billingCycle,
      status: 'active',
      trial_ends_at: null,
    })
    .eq('user_id', targetUserId);
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient<Database>>
) {
  const userId = await getUserIdByCustomer(subscription.customer as string, supabase);
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceIdToPlan(priceId);
  const billingCycle = subscription.items.data[0]?.price.recurring?.interval === 'year'
    ? 'yearly'
    : 'monthly';

  const status =
    subscription.status === 'active'
      ? 'active'
      : subscription.status === 'past_due'
      ? 'past_due'
      : subscription.status === 'canceled'
      ? 'canceled'
      : 'trialing';

  await supabase
    .from('subscriptions')
    .update({ plan, billing_cycle: billingCycle, status })
    .eq('user_id', userId);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof createClient<Database>>
) {
  const userId = await getUserIdByCustomer(subscription.customer as string, supabase);
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', stripe_subscription_id: null })
    .eq('user_id', userId);
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof createClient<Database>>
) {
  const customerId = invoice.customer as string;
  const userId = await getUserIdByCustomer(customerId, supabase);
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('user_id', userId);

  // Get user email and send alert (email sending handled by Resend)
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();

  if (user?.email) {
    await sendPaymentFailedEmail(user.email);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

async function getUserIdByCustomer(
  customerId: string,
  supabase: ReturnType<typeof createClient<Database>>
): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.user_id ?? null;
}

function priceIdToPlan(priceId: string | undefined): string {
  const prices: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_STARTER_YEARLY ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO_MONTHLY ?? '']: 'pro',
    [process.env.STRIPE_PRICE_PRO_YEARLY ?? '']: 'pro',
    [process.env.STRIPE_PRICE_UNLIMITED_MONTHLY ?? '']: 'unlimited',
    [process.env.STRIPE_PRICE_UNLIMITED_YEARLY ?? '']: 'unlimited',
  };
  return prices[priceId ?? ''] ?? 'pro';
}

async function sendPaymentFailedEmail(email: string) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'QuitLoop <noreply@quitloop.app>',
        to: email,
        subject: 'Payment failed — update your billing to keep your streak',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2>Payment failed</h2>
            <p>We couldn't process your QuitLoop subscription payment.</p>
            <p>Update your billing details to keep your streak going and stay on track.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings"
               style="display:inline-block;background:#C0392B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
              Update billing
            </a>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('[payment_failed] email error:', err);
  }
}
