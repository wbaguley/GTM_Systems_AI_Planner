import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Loader2 } from "lucide-react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: plans, isLoading: plansLoading } = trpc.subscriptions.getPlans.useQuery();
  const { data: currentSubscription } = trpc.subscriptions.getMySubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const createCheckout = trpc.subscriptions.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handleSubscribe = (planId: number) => {
    if (!isAuthenticated) {
      setLocation("/");
      toast.error("Please sign in to subscribe");
      return;
    }
    
    createCheckout.mutate({ planId });
  };

  const essentialsFeatures = [
    "Platform tracking with AI upload",
    "Basic dashboard & analytics",
    "Export capabilities",
    "Email support",
    "Unlimited platforms",
  ];

  const proFeatures = [
    "Everything in Essentials",
    "GTM Framework builder",
    "Playbook Builder with automation",
    "ICP Assessment tools",
    "Advanced analytics & reporting",
    "Priority support",
    "Custom integrations",
  ];

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const essentialsPlan = plans?.find(p => p.name.toLowerCase().includes("essentials"));
  const proPlan = plans?.find(p => p.name.toLowerCase().includes("pro"));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include unlimited usage and are billed per user.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Essentials Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Essentials</CardTitle>
              <CardDescription>Perfect for tracking your tech stack</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${essentialsPlan?.price || "15"}</span>
                <span className="text-muted-foreground">/user/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {essentialsFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={currentSubscription?.plan.name === "Essentials" ? "outline" : "default"}
                onClick={() => essentialsPlan && handleSubscribe(essentialsPlan.id)}
                disabled={createCheckout.isPending || currentSubscription?.plan.name === "Essentials"}
              >
                {createCheckout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentSubscription?.plan.name === "Essentials" ? (
                  "Current Plan"
                ) : (
                  "Get Started"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>Complete GTM planning & automation</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${proPlan?.price || "30"}</span>
                <span className="text-muted-foreground">/user/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className={i === 0 ? "font-semibold" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                variant={currentSubscription?.plan.name === "Pro" ? "outline" : "default"}
                onClick={() => proPlan && handleSubscribe(proPlan.id)}
                disabled={createCheckout.isPending || currentSubscription?.plan.name === "Pro"}
              >
                {createCheckout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentSubscription?.plan.name === "Pro" ? (
                  "Current Plan"
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans are billed monthly. Cancel anytime.</p>
          <p className="mt-2">Need help choosing? <a href="mailto:support@gtmplanetary.com" className="text-primary hover:underline">Contact us</a></p>
        </div>
        
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

