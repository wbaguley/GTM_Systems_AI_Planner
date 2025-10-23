import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Calendar } from "lucide-react";


export default function GTMResults() {
  const [, params] = useRoute("/gtm-framework/results/:id");
  const [, setLocation] = useLocation();
  const assessmentId = params?.id ? parseInt(params.id) : 0;

  const { data: assessment, isLoading: assessmentLoading } = trpc.gtmFramework.getAssessment.useQuery(
    { id: assessmentId },
    { enabled: assessmentId > 0 }
  );

  const { data: result, isLoading: resultLoading } = trpc.gtmFramework.getResult.useQuery(
    { assessmentId },
    { enabled: assessmentId > 0 }
  );

  const downloadPDFMutation = trpc.gtmFramework.downloadPDF.useMutation();

  const isLoading = assessmentLoading || resultLoading;

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadPDFMutation.mutateAsync({ assessmentId });
      
      // Convert base64 to blob
      const byteCharacters = atob(response.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Analyzing your responses...</p>
      </div>
    );
  }

  if (!assessment || !result) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Results not found.</p>
        <Button className="mt-4" onClick={() => setLocation("/gtm-framework")}>
          Back to Frameworks
        </Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const };
    if (score >= 60) return { label: "Good", variant: "secondary" as const };
    if (score >= 40) return { label: "Fair", variant: "outline" as const };
    return { label: "Needs Improvement", variant: "destructive" as const };
  };

  const scoreBadge = getScoreBadge(result.overallScore);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/gtm-framework")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Frameworks
        </Button>
        <Button onClick={handleDownloadPDF} disabled={downloadPDFMutation.isPending}>
          {downloadPDFMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Assessment Results</CardTitle>
              <CardDescription>
                Completed on {new Date(assessment.completedAt || "").toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant={scoreBadge.variant} className="text-lg px-4 py-2">
              {scoreBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}/100
              </span>
            </div>
            <Progress value={result.overallScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(result.categoryScores as Record<string, number>).map(([category, score]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>
                    {score}/100
                  </span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Expert Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {result.aiAnalysis}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(result.strengths as string[]).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(result.gaps as string[]).map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(result.recommendations as Array<{ title: string; description: string; priority: string }>).map(
              (rec, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge
                      variant={
                        rec.priority === "high"
                          ? "destructive"
                          : rec.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Action Plan
          </CardTitle>
          <CardDescription>Phased implementation roadmap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(result.actionPlan as Array<{ phase: string; actions: string[]; timeline: string }>).map(
              (phase, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">{phase.phase}</h4>
                    <Badge variant="outline">{phase.timeline}</Badge>
                  </div>
                  <ul className="space-y-1 ml-4">
                    {phase.actions.map((action, actionIdx) => (
                      <li key={actionIdx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to implement these recommendations?</h3>
            <p className="text-muted-foreground">
              GTM Planetary can help you execute this action plan with our AI-powered automation solutions.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Schedule Consultation
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/gtm-framework")}>
                Take Another Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

