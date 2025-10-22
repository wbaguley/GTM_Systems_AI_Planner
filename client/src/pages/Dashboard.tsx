import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  AlertCircle 
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.platforms.stats.useQuery();
  const { data: platforms } = trpc.platforms.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentPlatforms = platforms?.slice(0, 5) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your tech stack and subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlatforms || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeCount || 0} active, {stats?.cancelledCount || 0} cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((stats?.monthlyTotal || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Costs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((stats?.yearlyTotal || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Annual subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Annual Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((stats?.estimatedAnnual || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Projected yearly spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Renewals</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Next 30 days
              </p>
            </div>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          {!stats?.upcomingRenewals || stats.upcomingRenewals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming renewals</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingRenewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{renewal.platform}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(renewal.renewalDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${((renewal.amount || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Added */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recently Added</CardTitle>
            <Link href="/platforms">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentPlatforms.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No platforms added yet
              </p>
              <Link href="/platforms">
                <Button>Add Your First Platform</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{platform.platform}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {platform.useCase || "No description"}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        platform.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : platform.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {platform.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

