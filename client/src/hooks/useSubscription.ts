import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function useSubscription() {
  const { user } = useAuth();
  const { data: subscription, isLoading } = trpc.subscriptions.getMySubscription.useQuery();
  const { data: tier } = trpc.subscriptions.getMyTier.useQuery();

  // Admins and Testers get full Pro access
  const isAdmin = user?.role === "admin";
  const isTester = user?.role === "tester";
  const hasFullAccess = isAdmin || isTester;

  const hasFeature = (feature: string): boolean => {
    // Admins and Testers have access to everything
    if (hasFullAccess) return true;

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

  const isPro = tier === "pro" || hasFullAccess;
  const isEssentials = tier === "essentials";
  const isFree = !subscription && !hasFullAccess;

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

