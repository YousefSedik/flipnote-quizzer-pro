
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const HistorySection: React.FC = () => {
  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: () => api.quiz.getHistory(),
    retry: 1,
    retryDelay: 1000,
  });

  const history = historyData?.results || [];

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3 items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <History className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>
        <p className="text-destructive mb-4">Failed to load quiz history.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Recent Activity</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              You haven't viewed any quizzes recently.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Recent Activity</h2>
      </div>
      <div className="space-y-3">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{item.title}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.last_accessed), { addSuffix: true })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {item.is_public ? 'Public Quiz' : 'Private Quiz'}
              </span>
              <Link to={`/quiz/${item.id}`}>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
