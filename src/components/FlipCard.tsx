
import React, { useState } from 'react';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface FlipCardProps {
  question: Question;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ question, className }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset selection when flipping back to question
    if (isFlipped) {
      setSelectedOption(null);
      setIsCorrect(null);
    }
  };

  const handleOptionClick = (option: string, isCorrectOption: boolean) => {
    if (isFlipped || selectedOption) return;
    
    setSelectedOption(option);
    setIsCorrect(isCorrectOption);
    
    // Give a small delay before flipping to show the selection
    setTimeout(() => {
      setIsFlipped(true);
    }, 300);
  };

  return (
    <div 
      className={cn(
        "flip-card w-full h-auto min-h-[250px] md:min-h-[300px]", 
        isFlipped ? "flipped" : "",
        className
      )}
    >
      <div className="flip-card-inner relative w-full h-full">
        {/* Front side (Question) */}
        <div className="flip-card-front absolute w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col">
          <div className="text-center mb-4">
            <p className="text-lg font-medium">{question.text}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
            </p>
          </div>
          
          {question.type === 'mcq' && question.options && (
            <div className="space-y-2 mt-auto overflow-y-auto max-h-[60%]">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option.text, option.isCorrect)}
                  className={cn(
                    "p-3 rounded-md border border-input cursor-pointer transition-all hover:bg-accent break-words",
                    selectedOption === option.text && "bg-primary text-primary-foreground"
                  )}
                >
                  {option.text}
                </div>
              ))}
            </div>
          )}
          
          {question.type !== 'mcq' && (
            <div className="text-center mt-auto">
              <div 
                onClick={handleFlip}
                className="cursor-pointer text-sm text-primary hover:underline"
              >
                Click to see answer
              </div>
            </div>
          )}
        </div>

        {/* Back side (Answer) */}
        <div 
          className={cn(
            "flip-card-back absolute w-full h-full rounded-lg shadow-md p-6 flex items-center justify-center",
            isCorrect === true ? "bg-green-600 text-white" : 
            isCorrect === false ? "bg-destructive text-destructive-foreground" : 
            "bg-primary text-primary-foreground"
          )}
          onClick={handleFlip}
        >
          <div className="text-center max-h-full overflow-y-auto w-full">
            {isCorrect !== null && (
              <div className="flex justify-center mb-4">
                {isCorrect ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-6 w-6" />
                    <span className="text-xl font-bold">Correct!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X className="h-6 w-6" />
                    <span className="text-xl font-bold">Incorrect</span>
                  </div>
                )}
              </div>
            )}
            
            <div>
              {question.type === 'mcq' && question.options ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold mb-3">Correct Answer:</h3>
                  <div className="overflow-y-auto max-h-[150px]">
                    {question.options.map((option) => (
                      <div 
                        key={option.id} 
                        className={cn(
                          "p-2 rounded-md mb-2 break-words",
                          option.isCorrect ? "bg-green-500/20" : "",
                          selectedOption === option.text && !option.isCorrect ? "bg-red-500/20" : ""
                        )}
                      >
                        {option.text} {option.isCorrect && "✓"}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-3">Answer:</h3>
                  <p className="break-words">{question.answer}</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm cursor-pointer hover:underline">Click to see question</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
