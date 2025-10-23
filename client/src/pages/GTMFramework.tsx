import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronRight, ChevronLeft, TrendingUp, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

export default function GTMFramework() {
  const [currentStep, setCurrentStep] = useState<"intro" | "assessment" | "results">("intro");
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [companyInfo, setCompanyInfo] = useState({ name: "", industry: "" });

  const { data: questions, isLoading: questionsLoading } = trpc.gtmFramework.getQuestions.useQuery();
  const { data: assessments } = trpc.gtmFramework.getMyAssessments.useQuery();
  const { data: currentAssessment } = trpc.gtmFramework.getAssessment.useQuery(
    { id: assessmentId! },
    { enabled: !!assessmentId && currentStep === "results" }
  );

  const createAssessmentMutation = trpc.gtmFramework.createAssessment.useMutation();
  const submitAssessmentMutation = trpc.gtmFramework.submitAssessment.useMutation();

  const categories = [
    { key: "market_strategy", label: "Market Strategy", icon: Target },
    { key: "sales_process", label: "Sales Process", icon: TrendingUp },
    { key: "marketing_ops", label: "Marketing Operations", icon: TrendingUp },
    { key: "customer_success", label: "Customer Success", icon: CheckCircle2 },
    { key: "revenue_ops", label: "Revenue Operations", icon: TrendingUp },
    { key: "team_enablement", label: "Team & Enablement", icon: Target },
  ];

  const currentCategoryQuestions = questions?.filter(
    (q) => q.category === categories[currentCategory].key
  ) || [];

  const totalQuestions = questions?.length || 0;
  const answeredQuestions = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleStartAssessment = async () => {
    const result = await createAssessmentMutation.mutateAsync({
      companyName: companyInfo.name,
      industry: companyInfo.industry,
    });
    setAssessmentId(result.id);
    setCurrentStep("assessment");
  };

  const handleAnswer = (questionId: number, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId) return;
    
    await submitAssessmentMutation.mutateAsync({
      id: assessmentId,
      responses,
    });
    
    setCurrentStep("results");
  };

  const isCurrentCategoryComplete = currentCategoryQuestions.every(
    (q) => responses[q.id] !== undefined
  );

  const isAllComplete = totalQuestions > 0 && answeredQuestions === totalQuestions;

  // Prepare radar chart data
  const radarData = currentAssessment ? [
    { category: "Market Strategy", score: currentAssessment.marketStrategyScore || 0, fullMark: 100 },
    { category: "Sales Process", score: currentAssessment.salesProcessScore || 0, fullMark: 100 },
    { category: "Marketing Ops", score: currentAssessment.marketingOpsScore || 0, fullMark: 100 },
    { category: "Customer Success", score: currentAssessment.customerSuccessScore || 0, fullMark: 100 },
    { category: "Revenue Ops", score: currentAssessment.revenueOpsScore || 0, fullMark: 100 },
    { category: "Team Enablement", score: currentAssessment.teamEnablementScore || 0, fullMark: 100 },
  ] : [];

  if (questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Intro Screen
  if (currentStep === "intro") {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">GTM Framework Analyzer</h1>
          <p className="text-muted-foreground text-lg">
            Assess your Go-To-Market maturity and get AI-powered recommendations
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Start New Assessment</CardTitle>
            <CardDescription>
              This comprehensive assessment evaluates your GTM operations across 6 key areas with 36 questions.
              You'll receive a detailed maturity score and personalized action plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name (Optional)</Label>
              <input
                id="company-name"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry (Optional)</Label>
              <input
                id="industry"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                placeholder="e.g., SaaS, E-commerce, Manufacturing"
              />
            </div>
            <Button onClick={handleStartAssessment} className="w-full" size="lg">
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        {assessments && assessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setAssessmentId(assessment.id);
                      setCurrentStep("results");
                    }}
                  >
                    <div>
                      <p className="font-medium">
                        {assessment.companyName || "Unnamed Assessment"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.assessmentDate).toLocaleDateString()} • Score: {assessment.overallScore}/100
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Assessment Screen
  if (currentStep === "assessment") {
    const CategoryIcon = categories[currentCategory].icon;
    
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">GTM Assessment</h1>
            <span className="text-sm text-muted-foreground">
              {answeredQuestions} / {totalQuestions} questions answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-6 gap-2 mb-8">
          {categories.map((cat, idx) => (
            <button
              key={cat.key}
              onClick={() => setCurrentCategory(idx)}
              className={`p-2 text-xs rounded-lg border transition-colors ${
                idx === currentCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CategoryIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{categories[currentCategory].label}</CardTitle>
                <CardDescription>
                  Question {currentCategory * 6 + 1}-{currentCategory * 6 + 6} of {totalQuestions}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentCategoryQuestions.map((question) => {
              const options = question.options ? JSON.parse(question.options as string) : [];
              
              return (
                <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
                  <Label className="text-base font-medium">{question.question}</Label>
                  
                  {question.questionType === "scale" && (
                    <RadioGroup
                      value={responses[question.id]?.toString()}
                      onValueChange={(value) => handleAnswer(question.id, parseInt(value))}
                    >
                      {options.map((opt: any) => (
                        <div key={opt.value} className="flex items-start space-x-2">
                          <RadioGroupItem value={opt.value.toString()} id={`q${question.id}-${opt.value}`} />
                          <Label htmlFor={`q${question.id}-${opt.value}`} className="font-normal cursor-pointer">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.questionType === "yes_no" && (
                    <RadioGroup
                      value={responses[question.id]}
                      onValueChange={(value) => handleAnswer(question.id, value)}
                    >
                      {options.map((opt: any) => (
                        <div key={opt.value} className="flex items-start space-x-2">
                          <RadioGroupItem value={opt.value} id={`q${question.id}-${opt.value}`} />
                          <Label htmlFor={`q${question.id}-${opt.value}`} className="font-normal cursor-pointer">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.questionType === "multiple_choice" && (
                    <RadioGroup
                      value={responses[question.id]}
                      onValueChange={(value) => handleAnswer(question.id, value)}
                    >
                      {options.map((opt: any) => (
                        <div key={opt.value} className="flex items-start space-x-2">
                          <RadioGroupItem value={opt.value} id={`q${question.id}-${opt.value}`} />
                          <Label htmlFor={`q${question.id}-${opt.value}`} className="font-normal cursor-pointer">
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCategory === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentCategory < categories.length - 1 ? (
            <Button onClick={handleNext} disabled={!isCurrentCategoryComplete}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isAllComplete || submitAssessmentMutation.isPending}
            >
              {submitAssessmentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Submit & Get Results"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Results Screen
  if (currentStep === "results" && currentAssessment) {
    const scoreColor = (score: number) => {
      if (score >= 80) return "text-green-600";
      if (score >= 60) return "text-yellow-600";
      return "text-red-600";
    };

    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">GTM Assessment Results</h1>
          <p className="text-muted-foreground">
            {currentAssessment.companyName || "Your"} GTM Maturity Analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overall GTM Maturity Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-bold ${scoreColor(currentAssessment.overallScore || 0)}`}>
                  {currentAssessment.overallScore || 0}
                </div>
                <div className="text-muted-foreground mt-2">out of 100</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle>Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {currentAssessment.strengths ? (
                  <div className="whitespace-pre-wrap">{currentAssessment.strengths}</div>
                ) : (
                  <p className="text-muted-foreground">Analyzing...</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle>Gaps & Weaknesses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {currentAssessment.gaps ? (
                  <div className="whitespace-pre-wrap">{currentAssessment.gaps}</div>
                ) : (
                  <p className="text-muted-foreground">Analyzing...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {currentAssessment.recommendations ? (
                <div className="whitespace-pre-wrap">{currentAssessment.recommendations}</div>
              ) : (
                <p className="text-muted-foreground">Analyzing...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <CardTitle>90-Day Action Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {currentAssessment.actionPlan ? (
                <div className="whitespace-pre-wrap">{currentAssessment.actionPlan}</div>
              ) : (
                <p className="text-muted-foreground">Analyzing...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button onClick={() => {
            setCurrentStep("intro");
            setResponses({});
            setAssessmentId(null);
          }}>
            Take New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

