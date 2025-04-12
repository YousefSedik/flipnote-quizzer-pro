
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogOut, LogIn, UserPlus, Menu, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';

const Header: React.FC = () => {
  const location = useLocation();
  const { authState, logout } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Flipnote Quizzer Pro
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/quizzes">
                <Button variant="ghost">My Quizzes</Button>
              </Link>
              <Link to="/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4 py-4">
              {isAuthenticated ? (
                <>
                  <SheetClose asChild>
                    <Link to="/quizzes">
                      <Button variant="ghost" className="w-full justify-start">
                        My Quizzes
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/create">
                      <Button className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Quiz
                      </Button>
                    </Link>
                  </SheetClose>
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link to="/login">
                      <Button variant="outline" className="w-full justify-start">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/register">
                      <Button className="w-full justify-start">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
