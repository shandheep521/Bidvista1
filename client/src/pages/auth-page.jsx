import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters long',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long',
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters long',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Redirect to home page if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = (data) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Welcome to BidVista
              </h1>
              <p className="text-secondary-light mb-6">
                Join our trusted auction platform to discover unique items, place bids, 
                and connect with buyers and sellers from around the world.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-secondary mb-4">Why Join BidVista?</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Access to thousands of unique items and collectibles</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Secure bidding and payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Real-time notifications for bid activity</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Tools for sellers to manage listings and inventory</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1611095973362-88e8e2557e58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Auction items" 
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>

            <div>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    {activeTab === 'login' ? 'Sign In to Your Account' : 'Create a New Account'}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {activeTab === 'login' 
                      ? 'Enter your credentials to access your account' 
                      : 'Join BidVista to start bidding and selling'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Create a password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm your password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center mb-2">
                            <input 
                              type="checkbox" 
                              id="termsCheck"
                              className="mr-2"
                              required
                            />
                            <label htmlFor="termsCheck" className="text-sm text-secondary-light">
                              I agree to the <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
                            </label>
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-dark"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="w-full border-t pt-4">
                    <p className="text-sm text-center text-secondary-light">
                      {activeTab === 'login' 
                        ? "Don't have an account?" 
                        : "Already have an account?"}
                      <button
                        type="button"
                        className="ml-1 text-primary hover:underline"
                        onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                      >
                        {activeTab === 'login' ? 'Register' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuthPage;
