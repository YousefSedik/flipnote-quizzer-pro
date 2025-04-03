
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Flipnote Quizzer Pro
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/quizzes">
            <Button variant="ghost">My Quizzes</Button>
          </Link>
          <Link to="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
