import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GTMAssessment() {
  const [, params] = useRoute("/gtm-framework/assessment/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assessmentId = params?.id ? parseInt(params.id) : 0;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [currentCategory, setCurrentCategory] = useState("");

  const { data: assessment, isLoading: assessmentLoading } = trpc.gtmFramework.getAssessment.useQuery(
    { id: assessmentId },
    { enabled: assessmentId > 0 }
  );

  const { data: framework } = trpc.gtmFramework.getFramework.useQuery(
    { slug: "" },
    { enabled: false }
  );

  const { data: questions, isLoading: questionsLoading } = trpc.gtmFramework.getQuestions.useQuery(
    { frameworkId: assessment?.frameworkId || 0 },
    { enabled: !!assessment?.frameworkId }
  );

  const { data: existingResponses } = trpc.gtmFramework.getResponses.useQuery(
    { assessmentId },
    { enabled: assessmentId > 0 }
  );

  const saveResponseMutation = trpc.gtmFramework.saveResponse.useMutation();
  const completeAssessmentMutation = trpc.gtmFramework.completeAssessment.useMutation();

  // Load existing responses
  useEffect(() => {
    if (existingResponses) {
      const responsesMap: Record<number, string> = {};
      existingResponses.forEach((r) => {
        responsesMap[r.questionId] = r.responseValue;
      });
      setResponses(responsesMap);
    }
  }, [existingResponses]);

  // Update current category when question changes
  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      setCurrentCategory(questions[currentQuestionIndex].category);
    }
  }, [currentQuestionIndex, questions]);

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSaveAndNext = async () => {
    if (!questions) return;

    const currentQuestion = questions[currentQuestionIndex];
    const responseValue = responses[currentQuestion.id];

    if (!responseValue && currentQuestion.isRequired) {
      toast({
        title: "Response required",
        description: "Please answer this question before continuing.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveResponseMutation.mutateAsync({
        assessmentId,
        questionId: currentQuestion.id,
        responseValue: responseValue || "",
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Last question - complete assessment
        await handleComplete();
      }
    } catch (error) {
      toast({
        title: "Error saving response",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    try {
      await completeAssessmentMutation.mutateAsync({ assessmentId });
      toast({
        title: "Assessment completed!",
        description: "Generating your analysis...",
      });
      setLocation(`/gtm-framework/results/${assessmentId}`);
    } catch (error) {
      toast({
        title: "Error completing assessment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (assessmentLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment || !questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assessment not found.</p>
        <Button className="mt-4" onClick={() => setLocation("/gtm-framework")}>
          Back to Frameworks
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentResponse = responses[currentQuestion.id] || "";

  // Group questions by category for navigation
  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const categoryProgress = categories.map((cat) => {
    const catQuestions = questions.filter((q) => q.category === cat);
    const answered = catQuestions.filter((q) => responses[q.id]).length;
    return { category: cat, total: catQuestions.length, answered };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/gtm-framework")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Frameworks
        </Button>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{currentCategory}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category Progress Pills */}
      <div className="flex flex-wrap gap-2">
        {categoryProgress.map((cat) => (
          <div
            key={cat.category}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              cat.category === currentCategory
                ? "bg-primary text-primary-foreground"
                : cat.answered === cat.total
                ? "bg-green-100 text-green-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cat.category} ({cat.answered}/{cat.total})
          </div>
        ))}
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.questionText}</CardTitle>
          {currentQuestion.helpText && (
            <CardDescription>{currentQuestion.helpText}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Text Input */}
          {currentQuestion.questionType === "text" && (
            <Textarea
              value={currentResponse}
              onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
              placeholder="Enter your response..."
              rows={4}
            />
          )}

          {/* Rating (1-5) */}
          {currentQuestion.questionType === "rating" && (
            <RadioGroup
              value={currentResponse}
              onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
            >
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                    <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Low</span>
                <span>High</span>
              </div>
            </RadioGroup>
          )}

          {/* Multiple Choice (Single Select) */}
          {currentQuestion.questionType === "multipleChoice" &&
            currentQuestion.options &&
            !Array.isArray(JSON.parse(currentResponse || "[]")) && (
              <RadioGroup
                value={currentResponse}
                onValueChange={(value) => handleResponseChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {(currentQuestion.options as string[]).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${option}`} />
                      <Label htmlFor={`option-${option}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

          {/* Multiple Choice (Multi Select) - if response is array */}
          {currentQuestion.questionType === "multipleChoice" &&
            currentQuestion.options &&
            (currentResponse.startsWith("[") || currentResponse === "") && (
              <div className="space-y-3">
                {(currentQuestion.options as string[]).map((option) => {
                  const selected = currentResponse
                    ? JSON.parse(currentResponse).includes(option)
                    : false;
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkbox-${option}`}
                        checked={selected}
                        onCheckedChange={(checked) => {
                          const current = currentResponse
                            ? JSON.parse(currentResponse)
                            : [];
                          const updated = checked
                            ? [...current, option]
                            : current.filter((o: string) => o !== option);
                          handleResponseChange(currentQuestion.id, JSON.stringify(updated));
                        }}
                      />
                      <Label htmlFor={`checkbox-${option}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleSaveAndNext}
          disabled={saveResponseMutation.isPending || completeAssessmentMutation.isPending}
        >
          {saveResponseMutation.isPending || completeAssessmentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : currentQuestionIndex === questions.length - 1 ? (
            <>
              Complete Assessment
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

