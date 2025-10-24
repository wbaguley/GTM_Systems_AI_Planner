import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CheckCircle, Target } from 'lucide-react';

export default function ICPQuestionnaire() {
  const [, params] = useRoute('/icp-assessment/:id/questionnaire');
  const [, setLocation] = useLocation();
  const assessmentId = params?.id ? parseInt(params.id) : 0;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  // Fetch assessment
  const { data: assessment } = trpc.icpAssessment.getById.useQuery({ id: assessmentId });

  // Fetch sections and questions
  const { data: sections } = trpc.icpAssessment.getSections.useQuery();
  const { data: questions } = trpc.icpAssessment.getQuestions.useQuery(
    { sectionId: sections?.[currentSectionIndex]?.id || 0 },
    { enabled: !!sections?.[currentSectionIndex] }
  );

  // Fetch existing responses
  const { data: existingResponses } = trpc.icpAssessment.getResponses.useQuery({ assessmentId });

  // Save response mutation
  const saveResponseMutation = trpc.icpAssessment.saveResponse.useMutation();

  // Load existing responses
  useEffect(() => {
    if (existingResponses) {
      const responseMap: Record<number, string> = {};
      existingResponses.forEach((r: any) => {
        responseMap[r.questionId] = r.response;
      });
      setResponses(responseMap);
    }
  }, [existingResponses]);

  if (!assessment || !sections || !questions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = sections.reduce((sum: number, section: any) => {
    return sum + (section.questionCount || 0);
  }, 0);

  // Calculate progress
  let answeredCount = 0;
  sections.forEach((section: any) => {
    const sectionQuestions = questions.filter((q: any) => q.sectionId === section.id);
    sectionQuestions.forEach((q: any) => {
      if (responses[q.id]) answeredCount++;
    });
  });
  const progressPercent = (answeredCount / totalQuestions) * 100;

  const handleResponseChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSaveAndNext = async () => {
    // Save current response
    if (responses[currentQuestion.id]) {
      await saveResponseMutation.mutateAsync({
        assessmentId,
        questionId: currentQuestion.id,
        response: responses[currentQuestion.id]
      });
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      // Move to next section
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All done - navigate to results
      setLocation(`/icp-assessment/${assessmentId}/results`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      // Set to last question of previous section
      const prevSectionQuestions = questions.filter(
        (q: any) => q.sectionId === sections[currentSectionIndex - 1].id
      );
      setCurrentQuestionIndex(prevSectionQuestions.length - 1);
    }
  };

  const isFirstQuestion = currentSectionIndex === 0 && currentQuestionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {assessment.companyName} - ICP Assessment
              </h1>
              <p className="text-gray-600">
                {assessment.industry} • {assessment.companySize}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}: {currentSection.name}
              </span>
              <span className="font-medium text-blue-600">
                {answeredCount} of {totalQuestions} answered ({Math.round(progressPercent)}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Section Pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {sections.map((section: any, index: number) => (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSectionIndex(index);
                  setCurrentQuestionIndex(0);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === currentSectionIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
                <CardDescription className="text-lg font-medium text-gray-900">
                  {currentQuestion.question}
                </CardDescription>
                {currentQuestion.helpText && (
                  <p className="text-sm text-gray-600 mt-2">
                    💡 {currentQuestion.helpText}
                  </p>
                )}
              </div>
              {responses[currentQuestion.id] && (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-4" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(currentQuestion.questionType === 'text' || currentQuestion.questionType === 'textarea') && (
              <Textarea
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px]"
              />
            )}

            {currentQuestion.questionType === 'rating' && (
              <RadioGroup
                value={responses[currentQuestion.id] || ''}
                onValueChange={handleResponseChange}
              >
                <div className="space-y-3">
                  {['1 - Not at all', '2 - Slightly', '3 - Moderately', '4 - Very', '5 - Extremely'].map(
                    (option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </RadioGroup>
            )}

            {(currentQuestion.questionType === 'select' || currentQuestion.questionType === 'multiple_choice') && (() => {
              if (!currentQuestion.options) return null;
              const optionsArray = (typeof currentQuestion.options === 'string' 
                ? JSON.parse(currentQuestion.options) 
                : currentQuestion.options) as string[];
              
              return (
                <RadioGroup
                  value={responses[currentQuestion.id] || ''}
                  onValueChange={handleResponseChange}
                >
                  <div className="space-y-3">
                    {optionsArray.map((option: string) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              );
            })()}

            {currentQuestion.questionType === 'multiselect' && (() => {
              if (!currentQuestion.options) return null;
              const optionsArray = (typeof currentQuestion.options === 'string' 
                ? JSON.parse(currentQuestion.options) 
                : currentQuestion.options) as string[];
              const selectedValues = responses[currentQuestion.id] 
                ? JSON.parse(responses[currentQuestion.id]) 
                : [];
              
              const handleCheckboxChange = (option: string, checked: boolean) => {
                let newValues = [...selectedValues];
                if (checked) {
                  if (!newValues.includes(option)) {
                    newValues.push(option);
                  }
                } else {
                  newValues = newValues.filter(v => v !== option);
                }
                handleResponseChange(JSON.stringify(newValues));
              };
              
              return (
                <div className="space-y-3">
                  {optionsArray.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={selectedValues.includes(option)}
                        onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                      />
                      <Label htmlFor={option} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleSaveAndNext}
            disabled={!responses[currentQuestion.id]}
          >
            {isLastSection && isLastQuestion ? (
              <>
                Complete Assessment
                <CheckCircle className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

