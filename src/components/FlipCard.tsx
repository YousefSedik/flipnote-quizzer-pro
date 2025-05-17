import React, { useState, useRef, useEffect } from 'react';
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
  const [cardHeight, setCardHeight] = useState<number>(0);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Update card height when content changes
  useEffect(() => {
    const updateHeight = () => {
      if (frontRef.current && backRef.current) {
        const frontHeight = frontRef.current.scrollHeight;
        const backHeight = backRef.current.scrollHeight;
        setCardHeight(Math.max(frontHeight, backHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [question, isFlipped]);

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
        "flip-card w-full transition-all duration-300",
        isFlipped ? "flipped" : "",
        className
      )}
      style={{ height: cardHeight ? `${cardHeight}px` : 'auto' }}
    >
      <div className="flip-card-inner relative w-full h-full">
        {/* Front side (Question) */}
        <div 
          ref={frontRef}
          className="flip-card-front absolute w-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col"
        >
          <div className="text-center mb-4">
            <p className="text-lg font-medium">{question.text}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
            </p>
          </div>
          
          {question.type === 'mcq' && question.options && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option.text, option.isCorrect)}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                    "hover:bg-accent/50 hover:border-accent hover:scale-[1.02]",
                    selectedOption === option.text && "bg-primary/10 border-primary",
                    selectedOption && !option.isCorrect && selectedOption === option.text && "bg-red-100 border-red-500",
                    selectedOption && option.isCorrect && "bg-green-100 border-green-500"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0",
                      selectedOption === option.text && option.isCorrect && "border-green-500 bg-green-100",
                      selectedOption === option.text && !option.isCorrect && "border-red-500 bg-red-100",
                      !selectedOption && "border-input"
                    )}>
                      {selectedOption === option.text && (
                        option.isCorrect ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )
                      )}
                    </div>
                    <span className="flex-1 break-words">{option.text}</span>
                  </div>
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
          ref={backRef}
          className="flip-card-back absolute w-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col"
        >
          <div className="flex-1">
            {question.type === 'mcq' && question.options ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-3">Results:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option) => (
                    <div 
                      key={option.id} 
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        option.isCorrect && "bg-green-100 border-green-500",
                        selectedOption === option.text && !option.isCorrect && "bg-red-100 border-red-500",
                        selectedOption === option.text && option.isCorrect && "bg-green-100 border-green-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0",
                          option.isCorrect && "border-green-500 bg-green-100",
                          selectedOption === option.text && !option.isCorrect && "border-red-500 bg-red-100"
                        )}>
                          {option.isCorrect ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : selectedOption === option.text ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block break-words">{option.text}</span>
                          <div className="flex gap-2 mt-1">
                            {option.isCorrect && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Correct Answer</span>
                            )}
                            {selectedOption === option.text && !option.isCorrect && (
                              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">Your Answer</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={cn(
                  "mt-4 p-3 rounded-lg text-center font-medium",
                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {isCorrect ? "Correct!" : "Incorrect!"}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold mb-3">Answer:</h3>
                <p className="break-words">{question.answer}</p>
              </div>
            )}
          </div>
          <div 
            onClick={handleFlip}
            className="mt-4 text-sm text-primary cursor-pointer hover:underline text-center"
          >
            Click to see question
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
