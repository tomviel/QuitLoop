import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { PainSection } from '@/components/landing/PainSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { MasterySection } from '@/components/landing/MasterySection';
import { CommunitySection } from '@/components/landing/CommunitySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';

export default async function RootPage() {
  // Authenticated users skip the landing page
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();
    redirect(sub ? '/dashboard' : '/onboarding');
  }

  return (
    <div className="min-h-screen bg-bg">
      <LandingNav />
      <main>
        <Hero />
        <PainSection />
        <HowItWorks />
        <MasterySection />
        <CommunitySection />
        <PricingSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
