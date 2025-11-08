import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Users, BookOpen, Brain, Trophy, TrendingUp, Clock, Target, CheckCircle, ArrowRight, Sparkles, Award, MessageSquare } from 'lucide-react';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import heroImage1 from '@/assets/ai-tutor-hero-1.png';
import heroImage2 from '@/assets/ai-tutor-hero-2.png';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'parent' as UserRole
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(signInData.email, signInData.password);
      
      if (!result.success) {
        toast({
          title: "Sign In Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in."
        });
        onAuthSuccess(null);
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(
        signUpData.email,
        signUpData.password,
        signUpData.fullName,
        signUpData.role,
        signUpData.phone || undefined
      );
      
      if (!result.success) {
        toast({
          title: "Sign Up Failed",
          description: result.error || "Unknown error",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to Caribbean AI Tutor!"
        });
        onAuthSuccess(null);
      }
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showAuthForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Caribbean AI Tutor
            </h1>
            <p className="text-gray-600 mt-2">Personalized learning for exam success</p>
            <Button
              variant="ghost"
              onClick={() => setShowAuthForm(false)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Button>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <Label htmlFor="signin-email">Email Address</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                        className="mt-1"
                        data-testid="input-signin-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        required
                        className="mt-1"
                        data-testid="input-signin-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                      data-testid="button-signin"
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        required
                        className="mt-1"
                        data-testid="input-signup-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email Address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                        className="mt-1"
                        data-testid="input-signup-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-role">I am a</Label>
                      <Select value={signUpData.role} onValueChange={(value: UserRole) => setSignUpData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger className="mt-1" data-testid="select-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent/Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="mt-1"
                        data-testid="input-signup-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a password"
                        required
                        className="mt-1"
                        data-testid="input-signup-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        required
                        className="mt-1"
                        data-testid="input-signup-confirm"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                      data-testid="button-signup"
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Caribbean AI Tutor
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Personalized AI-Powered Learning for Exam Success
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Helping Caribbean students from Infant 1 to Form 6 excel in Common Entrance, SEA, CSEC, and CAPE exams with intelligent, adaptive tutoring
          </p>
        </div>

        {/* Hero Images */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img 
              src={heroImage1} 
              alt="Students learning with AI Tutor" 
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white font-semibold text-lg">Engaging Interactive Learning</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img 
              src={heroImage2} 
              alt="Students achieving success" 
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white font-semibold text-lg">Building Confidence & Success</p>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl transform hover:scale-105 transition-all"
            onClick={() => setShowAuthForm(true)}
            data-testid="button-get-started-parent"
          >
            <Users className="mr-2 h-5 w-5" />
            Parents - Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg shadow-lg transform hover:scale-105 transition-all"
            onClick={() => setShowAuthForm(true)}
            data-testid="button-get-started-student"
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            Students - Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Key Features Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Why Choose Caribbean AI Tutor?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Advanced features designed specifically for Caribbean students and their families
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Tutoring</h3>
                <p className="text-gray-600">
                  Intelligent AI adapts to each student's learning style, providing personalized explanations, step-by-step guidance, and instant feedback on every problem.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Caribbean Curriculum</h3>
                <p className="text-gray-600">
                  Content aligned with Caribbean education systems - from Infant levels through Form 6, covering Common Entrance, SEA, CSEC, and CAPE exams.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-indigo-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
                <p className="text-gray-600">
                  Detailed analytics show mastery levels, weak areas, and improvement over time. Parents receive weekly progress reports and achievement notifications.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-amber-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gamification & Rewards</h3>
                <p className="text-gray-600">
                  Students earn XP, unlock badges, and compete on leaderboards. Intelligent reward recommendations keep students motivated and engaged.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Adaptive Learning</h3>
                <p className="text-gray-600">
                  AI identifies struggling areas and automatically adjusts difficulty. Age-appropriate questions tailored to grade level and uploaded curriculum documents.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-rose-500 transition-all hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Parent Engagement</h3>
                <p className="text-gray-600">
                  Comprehensive parent dashboards with goal setting, email notifications for milestones, and insights into your child's learning journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto mb-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Sign Up & Create Profile</h4>
                <p className="text-gray-600">Parents create accounts and add their children with grade level and target exam information.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Choose Subject & Topic</h4>
                <p className="text-gray-600">Students select from Math, English, Science, or Social Studies and pick specific topics to practice.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Learn with AI Guidance</h4>
                <p className="text-gray-600">AI tutor provides step-by-step help, hints, and explanations tailored to the student's grade level and curriculum.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Track Progress & Earn Rewards</h4>
                <p className="text-gray-600">Students earn XP and badges while parents monitor progress through detailed dashboards and email updates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Students */}
            <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  For Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Get instant help anytime, no waiting for tutors</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Learn at your own pace with adaptive difficulty</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Build confidence with positive reinforcement</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Compete with classmates on leaderboards</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Ace your Common Entrance, SEA, or CSEC exams</p>
                </div>
              </CardContent>
            </Card>

            {/* For Parents */}
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="h-6 w-6 text-purple-600" />
                  For Parents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Monitor all your children from one dashboard</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Receive email alerts for achievements and struggles</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Set learning goals and track completion</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Get AI-powered reward recommendations</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Affordable alternative to private tutoring</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-xl mb-8 text-blue-50">
            Join hundreds of Caribbean families already seeing better grades and more confident students
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl transform hover:scale-105 transition-all"
              onClick={() => setShowAuthForm(true)}
              data-testid="button-cta-signup"
            >
              <Users className="mr-2 h-5 w-5" />
              Sign Up Free - No Credit Card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            Start your free trial today • Cancel anytime • No commitment required
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
