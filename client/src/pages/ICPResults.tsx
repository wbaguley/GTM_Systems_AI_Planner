import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Sparkles, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Zap,
  Download
} from 'lucide-react';

export default function ICPResults() {
  const [, params] = useRoute('/icp-assessment/:id/results');
  const [, setLocation] = useLocation();
  const assessmentId = params?.id ? parseInt(params.id) : 0;
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch assessment
  const { data: assessment } = trpc.icpAssessment.getById.useQuery({ id: assessmentId });

  // Fetch analysis results
  const { data: analysis, refetch: refetchAnalysis } = trpc.icpAssessment.getAnalysis.useQuery(
    { assessmentId },
    { enabled: !!assessmentId }
  );

  // Generate analysis mutation
  const generateAnalysisMutation = trpc.icpAssessment.generateAnalysis.useMutation({
    onSuccess: () => {
      refetchAnalysis();
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Failed to generate analysis:', error);
      setIsGenerating(false);
    }
  });

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    await generateAnalysisMutation.mutateAsync({ assessmentId });
  };

  if (!assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // If no analysis exists, show generate button
  if (!analysis) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/icp-assessment')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Generate AI Analysis
            </CardTitle>
            <CardDescription>
              {assessment.companyName} - ICP Assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready for AI Analysis</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Our AI will analyze your assessment responses and generate personalized insights, 
                  recommendations, and a roadmap for optimizing your sales methodology and ICP.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleGenerateAnalysis}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Analysis
                  </>
                )}
              </Button>

              {isGenerating && (
                <p className="text-sm text-gray-500 mt-4">
                  This may take 30-60 seconds...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display analysis results
  const maturityLevel = (score: number) => {
    if (score >= 80) return { label: 'Optimizing', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Managed', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Defined', color: 'bg-yellow-500' };
    if (score >= 20) return { label: 'Developing', color: 'bg-orange-500' };
    return { label: 'Initial', color: 'bg-red-500' };
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button
        variant="ghost"
        onClick={() => setLocation('/icp-assessment')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assessments
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assessment.companyName}</h1>
            <p className="text-gray-600">ICP & Sales Enablement Assessment Results</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line">{analysis.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Maturity Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {analysis.overallScore}
              </div>
              <Progress value={analysis.overallScore} className="mb-2" />
              <Badge className={maturityLevel(analysis.overallScore).color}>
                {maturityLevel(analysis.overallScore).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Methodology Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {analysis.methodologyMaturityScore}
              </div>
              <Progress value={analysis.methodologyMaturityScore} className="mb-2" />
              <Badge className={maturityLevel(analysis.methodologyMaturityScore).color}>
                {maturityLevel(analysis.methodologyMaturityScore).label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enablement Maturity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {analysis.enablementMaturityScore}
              </div>
              <Progress value={analysis.enablementMaturityScore} className="mb-2" />
              <Badge className={maturityLevel(analysis.enablementMaturityScore).color}>
                {maturityLevel(analysis.enablementMaturityScore).label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="methodology" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methodology">Sales Methodology</TabsTrigger>
          <TabsTrigger value="enablement">Sales Enablement</TabsTrigger>
          <TabsTrigger value="roadmap">Action Plan</TabsTrigger>
        </TabsList>

        {/* Methodology Tab */}
        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {analysis.primaryMethodology}
                </Badge>
              </div>
              <p className="text-gray-700">{analysis.methodologyRationale}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(analysis.strengths as string[])?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  Gaps & Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(analysis.gaps as any[])?.map((gap, index) => (
                    <li key={index} className="border-l-2 border-orange-400 pl-3">
                      <div className="font-medium text-gray-900">{gap.gap}</div>
                      <div className="text-sm text-gray-600 mt-1">{gap.recommendation}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Impact: {gap.impact}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enablement Tab */}
        <TabsContent value="enablement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Wins (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analysis.quickWins as any[])?.map((win, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{win.initiative}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Effort: {win.effort}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-50">
                          Impact: {win.impact}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {win.timeline}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Strategic Initiatives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  ...(analysis.mediumTermGoals as any[] || []),
                  ...(analysis.longTermGoals as any[] || [])
                ].map((goal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{goal.initiative}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {goal.timeline}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Effort: {goal.effort}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50">
                          Impact: {goal.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Roadmap</CardTitle>
              <CardDescription>Phased approach to improving your sales methodology and enablement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(analysis.actionPlan as any[])?.map((phase, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-3">{phase.phase}</h3>
                    <ul className="space-y-2">
                      {phase.initiatives?.map((initiative: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{initiative}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Priorities</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {(analysis.recommendations as string[])?.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900">{rec}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regenerate Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleGenerateAnalysis}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Regenerate Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

