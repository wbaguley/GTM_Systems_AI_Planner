import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { trpc } from "@/lib/trpc";
import { Loader2, ExternalLink, Check, X, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BillingSettings() {
  const { subscription, tier, isPro, isEssentials, isFree, isLoading } = useSubscription();
  
  const createBillingPortal = trpc.subscriptions.createBillingPortal.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open billing portal");
    },
  });

  const cancelSubscription = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      toast.success("Subscription will be canceled at the end of the billing period");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  const reactivateSubscription = trpc.subscriptions.reactivate.useMutation({
    onSuccess: () => {
      toast.success("Subscription reactivated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate subscription");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">
                  {isFree && "Free"}
                  {isEssentials && "Essentials"}
                  {isPro && "Pro"}
                </h3>
                {subscription?.status && (
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                )}
              </div>
              {subscription && (
                <p className="text-sm text-muted-foreground mt-1">
                  ${subscription.plan.price}/user/month
                </p>
              )}
            </div>
            {!isFree && (
              <Link href="/pricing">
                <Button variant="outline">
                  {isPro ? "View Plans" : "Upgrade to Pro"}
                </Button>
              </Link>
            )}
            {isFree && (
              <Link href="/pricing">
                <Button>Subscribe Now</Button>
              </Link>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be canceled on {formatDate(subscription.currentPeriodEnd)}.
                You'll continue to have access until then.
              </AlertDescription>
            </Alert>
          )}

          {subscription && !subscription.cancelAtPeriodEnd && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Billing Period</p>
                <p className="font-medium">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>What's included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isFree && (
              <>
                <FeatureItem included>Platform tracking with AI upload</FeatureItem>
                <FeatureItem included>Basic dashboard</FeatureItem>
                <FeatureItem>GTM Framework builder</FeatureItem>
                <FeatureItem>Playbook Builder</FeatureItem>
                <FeatureItem>ICP Assessment tools</FeatureItem>
                <FeatureItem>Priority support</FeatureItem>
              </>
            )}
            {isEssentials && (
              <>
                <FeatureItem included>Platform tracking with AI upload</FeatureItem>
                <FeatureItem included>Basic dashboard & analytics</FeatureItem>
                <FeatureItem included>Export capabilities</FeatureItem>
                <FeatureItem included>Email support</FeatureItem>
                <FeatureItem>GTM Framework builder</FeatureItem>
                <FeatureItem>Playbook Builder with automation</FeatureItem>
                <FeatureItem>ICP Assessment tools</FeatureItem>
                <FeatureItem>Priority support</FeatureItem>
              </>
            )}
            {isPro && (
              <>
                <FeatureItem included>Everything in Essentials</FeatureItem>
                <FeatureItem included>GTM Framework builder</FeatureItem>
                <FeatureItem included>Playbook Builder with automation</FeatureItem>
                <FeatureItem included>ICP Assessment tools</FeatureItem>
                <FeatureItem included>Advanced analytics & reporting</FeatureItem>
                <FeatureItem included>Priority support</FeatureItem>
                <FeatureItem included>Custom integrations</FeatureItem>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Portal & Actions */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>Update payment method and view invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => createBillingPortal.mutate()}
              disabled={createBillingPortal.isPending}
              className="w-full"
            >
              {createBillingPortal.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Billing Portal
                </>
              )}
            </Button>

            <div className="pt-4 border-t">
              {subscription.cancelAtPeriodEnd ? (
                <Button
                  variant="outline"
                  onClick={() => reactivateSubscription.mutate()}
                  disabled={reactivateSubscription.isPending}
                  className="w-full"
                >
                  {reactivateSubscription.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reactivating...
                    </>
                  ) : (
                    "Reactivate Subscription"
                  )}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
                      cancelSubscription.mutate();
                    }
                  }}
                  disabled={cancelSubscription.isPending}
                  className="w-full"
                >
                  {cancelSubscription.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FeatureItem({ children, included = false }: { children: React.ReactNode; included?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <span className={included ? "" : "text-muted-foreground"}>{children}</span>
    </div>
  );
}

