import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Rocket, Waves, Target, Users, Zap, CheckCircle, Grid, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  TrendingUp,
  Rocket,
  Waves,
  Target,
  Users,
  Zap,
  CheckCircle,
  Grid,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  red: "bg-red-100 text-red-700 border-red-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function GTMFramework() {
  const [, setLocation] = useLocation();
  const [selectedFramework, setSelectedFramework] = useState<number | null>(null);
  
  const { data: frameworks, isLoading } = trpc.gtmFramework.listFrameworks.useQuery();
  const createAssessmentMutation = trpc.gtmFramework.createAssessment.useMutation();

  const handleStartAssessment = async (frameworkId: number) => {
    try {
      const assessment = await createAssessmentMutation.mutateAsync({
        frameworkId,
      });
      setLocation(`/gtm-framework/assessment/${assessment.id}`);
    } catch (error) {
      console.error("Failed to create assessment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">GTM Framework Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Choose a go-to-market framework to assess your business strategy and receive expert AI-powered recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks?.map((framework) => {
          const Icon = iconMap[framework.icon || "Target"];
          const colorClass = colorMap[framework.colorScheme || "blue"];
          
          return (
            <Card
              key={framework.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedFramework(framework.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${colorClass} border`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline">{framework.category}</Badge>
                </div>
                <CardTitle className="mt-4">{framework.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {framework.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                  variant={selectedFramework === framework.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartAssessment(framework.id);
                  }}
                  disabled={createAssessmentMutation.isPending}
                >
                  {createAssessmentMutation.isPending && selectedFramework === framework.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {frameworks && frameworks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No frameworks available yet.</p>
        </div>
      )}
    </div>
  );
}

