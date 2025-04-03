
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuizContext } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/types/quiz';

interface QuizFormProps {
  quiz?: Quiz;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz }) => {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const { createQuiz, updateQuiz } = useQuizContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    if (quiz) {
      const updatedQuiz = {
        ...quiz,
        title,
        description,
      };
      updateQuiz(updatedQuiz);
      navigate(`/quiz/${quiz.id}`);
    } else {
      const newQuiz = createQuiz(title, description);
      navigate(`/quiz/${newQuiz.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Quiz Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter quiz description"
          rows={4}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          {quiz ? 'Update Quiz' : 'Create Quiz'}
        </Button>
      </div>
    </form>
  );
};

export default QuizForm;
