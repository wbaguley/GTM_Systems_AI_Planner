import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "wouter";

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { hasFeature, isLoading, tier } = useSubscription();

  if (isLoading) {
    return null;
  }

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            This feature is available on {tier === "free" ? "Essentials and Pro" : "Pro"} plans
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/pricing">
            <Button size="lg">View Pricing</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

