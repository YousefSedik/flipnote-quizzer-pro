
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Question } from "@/types/quiz";
import { createExtractQuestionsUrl } from "@/utils/apiHelpers";
import { api } from "@/services/api";

interface ExtractQuestionResponse {
  mcq?: {
    text: string;
    options: string[];
    answer: string;
  }[];
  written?: {
    text: string;
    answer: string;
  }[];
}

export const useQuestionExtraction = (quizId: string | undefined) => {
  const [isUploading, setIsUploading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isReviewingQuestions, setIsReviewingQuestions] = useState(false);
  const [currentReviewQuestion, setCurrentReviewQuestion] = useState(0);
  const [questionText, setQuestionText] = useState("");
  
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "pdf" | "book"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !quizId) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    if (type === "pdf" && file.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("quizId", quizId);
      formData.append("type", type);

      if (type === "pdf") {
        const apiUrl = createExtractQuestionsUrl();

        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
          headers: {
            ...api.authHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to extract questions: " + response.status);
        }

        const extractedData: ExtractQuestionResponse = await response.json();
        const processedQuestions = processExtractedQuestions(extractedData);

        if (processedQuestions.length > 0) {
          setGeneratedQuestions(processedQuestions);
          setIsReviewingQuestions(true);
          setCurrentReviewQuestion(0);

          toast({
            title: "Success",
            description: processedQuestions.length + " questions extracted. Please review them before adding.",
          });
        } else {
          toast({
            title: "Warning",
            description: "No questions could be extracted from the PDF.",
          });
        }
      } else {
        const mockQuestions = [
          {
            id: "temp-" + Date.now() + "-1",
            text: "Who is the main character in this book?",
            type: "written" as const,
            answer: "Character name extracted from book",
          },
          {
            id: "temp-" + Date.now() + "-2",
            text: "What is the setting of this book?",
            type: "mcq" as const,
            answer: "Setting B",
            options: [
              { id: "1", text: "Setting A", isCorrect: false },
              { id: "2", text: "Setting B", isCorrect: true },
              { id: "3", text: "Setting C", isCorrect: false },
            ],
          },
        ];

        setGeneratedQuestions(mockQuestions);
        setIsReviewingQuestions(true);
        setCurrentReviewQuestion(0);

        toast({
          title: "Success",
          description: mockQuestions.length + " questions generated. Please review them before adding.",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!quizId || !questionText.trim()) {
      toast({
        title: "Error",
        description: "No text entered or invalid quiz ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const apiUrl = createExtractQuestionsUrl();

      const formData = new FormData();
      formData.append("text", questionText);
      formData.append("quizId", quizId);
      formData.append("type", "text");

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          ...api.authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to extract questions: " + response.status);
      }

      const extractedData: ExtractQuestionResponse = await response.json();
      const processedQuestions = processExtractedQuestions(extractedData);

      if (processedQuestions.length > 0) {
        setGeneratedQuestions(processedQuestions);
        setIsReviewingQuestions(true);
        setCurrentReviewQuestion(0);

        toast({
          title: "Success",
          description: processedQuestions.length + " questions extracted. Please review them before adding.",
        });
      } else {
        toast({
          title: "Warning",
          description: "No questions could be extracted from the text.",
        });
      }
    } catch (error) {
      console.error("Error processing text:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process text",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setQuestionText("");
    }
  };

  const processExtractedQuestions = (data: ExtractQuestionResponse): Question[] => {
    const questions: Question[] = [];
    
    // Process MCQ questions
    if (data.mcq && Array.isArray(data.mcq)) {
      data.mcq.forEach((q, index) => {
        const options = q.options.map((opt, optIndex) => ({
          id: optIndex.toString(),
          text: opt,
          isCorrect: opt === q.answer,
        }));
        
        questions.push({
          id: `temp-mcq-${Date.now()}-${index}`,
          text: q.text,
          type: "mcq",
          answer: q.answer,
          options,
        });
      });
    }
    
    // Process written questions
    if (data.written && Array.isArray(data.written)) {
      data.written.forEach((q, index) => {
        questions.push({
          id: `temp-written-${Date.now()}-${index}`,
          text: q.text,
          type: "written",
          answer: q.answer,
        });
      });
    }
    
    return questions;
  };

  return {
    isUploading,
    generatedQuestions,
    isReviewingQuestions,
    setIsReviewingQuestions,
    currentReviewQuestion,
    setCurrentReviewQuestion,
    questionText,
    setQuestionText,
    handleFileUpload,
    handleTextSubmit,
  };
};
