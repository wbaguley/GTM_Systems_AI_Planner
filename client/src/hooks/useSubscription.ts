import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const { data: subscription, isLoading } = trpc.subscriptions.getMySubscription.useQuery();
  const { data: tier } = trpc.subscriptions.getMyTier.useQuery();

  // Testers get full Pro access
  const isTester = user?.role === "tester";

  const hasFeature = (feature: string): boolean => {
    // Testers have access to everything
    if (isTester) return true;

    // No subscription = no access (removed free tier)
    if (!subscription) {
      return false;
    }

    // Parse features from plan
    const features = subscription.plan.features
      ? JSON.parse(subscription.plan.features)
      : [];

    return features.includes(feature);
  };

  const isPro = tier === "pro" || isTester;
  const isEssentials = tier === "essentials";
  const isFree = !subscription && !isTester;

  return {
    subscription,
    tier,
    isPro,
    isEssentials,
    isFree,
    hasFeature,
    isLoading,
  };
}

