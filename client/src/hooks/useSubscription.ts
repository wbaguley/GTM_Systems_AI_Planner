import { trpc } from "@/lib/trpc";

export function useSubscription() {
  const { data: subscription, isLoading } = trpc.subscriptions.getMySubscription.useQuery();
  const { data: tier } = trpc.subscriptions.getMyTier.useQuery();

  const hasFeature = (feature: string): boolean => {
    if (!subscription) {
      // Free tier - only platforms and ai_upload
      const freeFeatures = ["platforms", "ai_upload", "dashboard", "settings"];
      return freeFeatures.includes(feature);
    }

    // Parse features from plan
    const features = subscription.plan.features
      ? JSON.parse(subscription.plan.features)
      : [];

    return features.includes(feature);
  };

  const isPro = tier === "pro";
  const isEssentials = tier === "essentials";
  const isFree = tier === "free";

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

