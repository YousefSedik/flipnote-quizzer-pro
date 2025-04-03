
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question, QuestionType, Option } from '@/types/quiz';
import { useQuizContext } from '@/context/QuizContext';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/sonner';

interface QuestionFormProps {
  quizId: string;
  question?: Question;
  onComplete: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ quizId, question, onComplete }) => {
  const [questionText, setQuestionText] = useState(question?.text || '');
  const [questionType, setQuestionType] = useState<QuestionType>(question?.type || 'written');
  const [answer, setAnswer] = useState(question?.answer || '');
  const [options, setOptions] = useState<Option[]>(
    question?.options || [
      { id: uuidv4(), text: '', isCorrect: false },
      { id: uuidv4(), text: '', isCorrect: false },
    ]
  );

  const { addQuestion, updateQuestion } = useQuizContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (questionType === 'mcq') {
      // Check if at least 2 options
      if (options.length < 2) {
        toast.error('Please add at least 2 options');
        return;
      }
      
      // Check if any empty options
      if (options.some(option => !option.text.trim())) {
        toast.error('Please fill in all options');
        return;
      }
      
      // Check if at least one correct answer
      if (!options.some(option => option.isCorrect)) {
        toast.error('Please select at least one correct answer');
        return;
      }
    } else if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (question) {
      updateQuestion(quizId, {
        id: question.id,
        text: questionText,
        type: questionType,
        answer: questionType === 'mcq' ? 
          options.filter(o => o.isCorrect).map(o => o.text).join(', ') : 
          answer,
        options: questionType === 'mcq' ? options : undefined,
      });
    } else {
      addQuestion(quizId, {
        text: questionText,
        type: questionType,
        answer: questionType === 'mcq' ? 
          options.filter(o => o.isCorrect).map(o => o.text).join(', ') : 
          answer,
        options: questionType === 'mcq' ? options : undefined,
      });
    }

    onComplete();
  };

  const addOption = () => {
    setOptions([...options, { id: uuidv4(), text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast.error('You need at least 2 options');
      return;
    }
    setOptions(options.filter(option => option.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(
      options.map(option => (option.id === id ? { ...option, text } : option))
    );
  };

  const toggleCorrect = (id: string) => {
    setOptions(
      options.map(option => (option.id === id ? { ...option, isCorrect: !option.isCorrect } : option))
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="questionText" className="block text-sm font-medium mb-1">
          Question
        </label>
        <Textarea
          id="questionText"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium mb-1">Question Type</label>
        <RadioGroup 
          value={questionType} 
          onValueChange={(value) => setQuestionType(value as QuestionType)}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="written" id="written" />
            <Label htmlFor="written">Written Answer</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mcq" id="mcq" />
            <Label htmlFor="mcq">Multiple Choice</Label>
          </div>
        </RadioGroup>
      </div>

      {questionType === 'written' ? (
        <div>
          <label htmlFor="answer" className="block text-sm font-medium mb-1">
            Answer
          </label>
          <Textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the answer"
            required={questionType === 'written'}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Options (check the correct answer(s))
          </label>
          {options.map((option, index) => (
            <Card key={option.id} className="overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                    option.isCorrect ? 'bg-primary text-primary-foreground' : 'border border-input'
                  }`}
                  onClick={() => toggleCorrect(option.id)}
                >
                  {option.isCorrect && <span>✓</span>}
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeOption(option.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full" 
            onClick={addOption}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit">
          {question ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
