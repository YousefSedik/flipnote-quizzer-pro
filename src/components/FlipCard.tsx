
import React, { useState } from 'react';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  question: Question;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ question, className }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={cn(
        "flip-card w-full h-[200px] md:h-[250px] cursor-pointer", 
        isFlipped ? "flipped" : "",
        className
      )}
      onClick={handleFlip}
    >
      <div className="flip-card-inner relative w-full h-full">
        {/* Front side (Question) */}
        <div className="flip-card-front absolute w-full h-full bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">{question.text}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
            </p>
            <div className="mt-4 text-sm text-primary">Click to see answer</div>
          </div>
        </div>

        {/* Back side (Answer) */}
        <div className="flip-card-back absolute w-full h-full bg-primary text-primary-foreground rounded-lg shadow-md p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">
              {question.type === 'mcq' && question.options ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold mb-3">Answer:</h3>
                  {question.options.map((option, index) => (
                    <div 
                      key={option.id} 
                      className={cn(
                        "p-2 rounded-md",
                        option.isCorrect ? "bg-green-500/20" : ""
                      )}
                    >
                      {option.text} {option.isCorrect && "✓"}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-3">Answer:</h3>
                  <p>{question.answer}</p>
                </div>
              )}
            </p>
            <div className="mt-4 text-sm">Click to see question</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
