import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      // Navigation will be handled in the useEffect below
    } catch (error) {
      // Error is already handled in the login function
      console.error('Login error:', error);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/quizzes');
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center space-y-2 sm:space-y-3">
            <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-sm sm:text-base">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input className="pl-10 h-9 sm:h-10 text-sm sm:text-base" placeholder="Enter your email" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input className="pl-10 h-9 sm:h-10 text-sm sm:text-base" type="password" placeholder="Enter your password" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-9 sm:h-10 text-sm sm:text-base" disabled={authState.isLoading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {authState.isLoading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4">
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
