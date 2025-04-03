
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuizContext } from '@/context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { Quiz } from '@/types/quiz';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

interface QuizFormProps {
  quiz?: Quiz;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const QuizForm: React.FC<QuizFormProps> = ({ quiz }) => {
  const { createQuiz, updateQuiz } = useQuizContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: quiz?.title || '',
      description: quiz?.description || '',
      isPublic: quiz?.isPublic || false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (quiz) {
        const updatedQuiz = {
          ...quiz,
          title: values.title,
          description: values.description,
          isPublic: values.isPublic,
        };
        await updateQuiz(updatedQuiz);
        navigate(`/quiz/${quiz.id}`);
      } else {
        const newQuiz = await createQuiz(values.title, values.description, values.isPublic);
        navigate(`/quiz/${newQuiz.id}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter quiz title"
                  {...field}
                  className="w-full"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter quiz description"
                  rows={4}
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="public-mode"
                  />
                </FormControl>
                <Label htmlFor="public-mode" className="cursor-pointer">
                  Make quiz public
                </Label>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {quiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuizForm;
