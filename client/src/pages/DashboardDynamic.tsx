import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  DollarSign, 
  Calendar, 
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function DashboardDynamic() {
  // Get Platforms module
  const { data: modules = [] } = trpc.modules.list.useQuery();
  const platformsModule = modules.find(m => m.name === "Platforms");
  const moduleId = platformsModule?.id;

  // Get stats
  const { data: stats, isLoading: statsLoading } = trpc.modules.getStats.useQuery(
    { moduleId: moduleId! },
    { enabled: !!moduleId }
  );

  // Get recent platforms
  const { data: records = [] } = trpc.modules.listRecords.useQuery(
    { moduleId: moduleId! },
    { enabled: !!moduleId }
  );

  if (statsLoading || !moduleId) {
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

  const recentPlatforms = records.slice(0, 5);

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
            <div className="text-2xl font-bold">{stats?.totalCount || 0}</div>
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
              ${(stats?.monthlyTotal || 0).toFixed(2)}
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
              ${(stats?.yearlyTotal || 0).toFixed(2)}
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
              ${(stats?.estimatedAnnual || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Projected yearly spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recently Added</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest platforms in your stack
            </p>
          </div>
          <Link href="/platforms">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPlatforms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No platforms added yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentPlatforms.map((record: any) => {
                const data = record.data || {};
                const status = data.status || "Active";
                const statusColor = 
                  status === "Active" ? "bg-green-100 text-green-800" :
                  status === "Inactive" ? "bg-gray-100 text-gray-800" :
                  "bg-red-100 text-red-800";

                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {data.logoUrl && (
                        <img
                          src={data.logoUrl}
                          alt={data.platform}
                          className="w-10 h-10 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{data.platform}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {data.useCase || "No description"}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

