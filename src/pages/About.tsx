import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain, BookOpen, Users, GraduationCap, Target, Lightbulb,
  CheckCircle, ClipboardList, BarChart3, Trophy, MessageSquare,
  FileText, Database, Layers, ArrowRight
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Brain className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Caribbean AI Tutor</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              An intelligent tutoring platform built specifically for Caribbean students, powered by the Socratic teaching method.
            </p>
          </div>
        </section>

        <nav className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto py-3 text-sm">
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium">How It Works</a>
              <a href="#parent-guide" className="text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium">Parent Guide</a>
              <a href="#teacher-guide" className="text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium">Teacher Guide</a>
              <a href="#ai-training" className="text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium">AI Training Outline</a>
            </div>
          </div>
        </nav>

        <section id="how-it-works" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Socratic Teaching Method</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Instead of giving answers directly, our AI asks guiding questions that lead students to discover solutions themselves. This builds deeper understanding and critical thinking skills that last beyond the exam.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">Caribbean Curriculum Aligned</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Content is specifically designed for Caribbean grade levels — Infant 1-2, Standard 1-5, and Form 1-6 — and aligned with Common Entrance, SEA, CSEC, and CAPE exam requirements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Adaptive Difficulty</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    The AI adjusts question difficulty and vocabulary based on each student's grade level and target exam. A Standard 5 student preparing for SEA gets different content than a Form 4 student preparing for CSEC.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">Gamification & Motivation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Students earn XP points, achievement badges, and climb leaderboards as they learn. Weekly challenges and streaks keep motivation high and encourage regular practice habits.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white rounded-xl p-8 border">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Subjects & Exams Covered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Subjects</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Mathematics (all levels)</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> English Language Arts</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Science</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Social Studies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Exam Preparation</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Common Entrance</li>
                    <li className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> SEA (Secondary Entrance Assessment)</li>
                    <li className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> CSEC (Caribbean Secondary Education Certificate)</li>
                    <li className="flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> CAPE (Caribbean Advanced Proficiency Examination)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="parent-guide" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Parent Guide</h2>
            </div>

            <p className="text-gray-600 mb-8 text-lg">
              Everything you need to know to get your children started and make the most of Caribbean AI Tutor.
            </p>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">1</span>
                  Create Your Account
                </h3>
                <p className="text-gray-600 text-sm">
                  Click "Sign Up" from the homepage and select "Parent" as your role. Enter your full name, email address, and create a password. Once registered, you'll be taken to your parent dashboard where you can manage your children's learning.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">2</span>
                  Add Your Children
                </h3>
                <p className="text-gray-600 text-sm">
                  From your dashboard, click "Add Child" to create a profile for each of your children. You'll need to provide their name, age, current grade level (e.g. Standard 3, Form 2), and their target exam (Common Entrance, SEA, CSEC, etc.). Each child gets their own personalised learning path.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">3</span>
                  Choose a Subject
                </h3>
                <p className="text-gray-600 text-sm">
                  After adding your children, select a subject (Mathematics, English, Science, or Social Studies). The dashboard will show your children enrolled in that subject and their progress.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">4</span>
                  Monitor Progress
                </h3>
                <p className="text-gray-600 text-sm">
                  Your parent dashboard shows key metrics for each child: topics completed, average scores, time spent learning, and areas that need more practice. Click "View Analytics" on any child's card to see detailed performance charts, session history, and topic-by-topic breakdowns.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">5</span>
                  Understand Badges & XP
                </h3>
                <p className="text-gray-600 text-sm">
                  Your children earn experience points (XP) for every learning activity they complete. XP unlocks achievement badges that celebrate milestones like completing their first session, maintaining a learning streak, or mastering a topic. Check the "Achievement Center" tab on your dashboard to see all earned badges and XP totals.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Tips for Encouraging Your Child
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Set a regular study schedule — even 15 to 20 minutes daily makes a difference</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Celebrate their badges and XP achievements to keep them motivated</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Encourage them to use the "hint" feature rather than skipping difficult questions</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Review their progress together weekly — ask about what topics they enjoyed</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Remind them that mistakes are part of learning — the AI tutor is patient and supportive</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="teacher-guide" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-100 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Teacher Guide</h2>
            </div>

            <p className="text-gray-600 mb-8 text-lg">
              Caribbean AI Tutor is designed to complement your classroom teaching, not replace it. Here's how to integrate it into your workflow.
            </p>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">1</span>
                  Getting Set Up
                </h3>
                <p className="text-gray-600 text-sm">
                  Your school administrator will create your teacher account and assign you to classes. Once logged in, you'll see your Teacher Dashboard with an overview of all your classes and students. You can also request a teacher account through the "Contact Us" page.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">2</span>
                  Enrolling Students
                </h3>
                <p className="text-gray-600 text-sm">
                  From your class overview, you can add students to your classes. Students can be enrolled by their parents or added by you directly. Each student's progress is tracked individually within your class, giving you a clear picture of how each child is performing.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">3</span>
                  Monitoring Class Performance
                </h3>
                <p className="text-gray-600 text-sm">
                  The Performance Analytics section shows you aggregate class data: average scores by topic, completion rates, and which topics students are struggling with most. Use this to identify areas where your class might need additional in-person instruction or review.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center">4</span>
                  Understanding Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  Each student's profile shows detailed metrics: time spent on the platform, topics attempted vs completed, average accuracy, hints used, and learning patterns. Look for students with low completion rates or high hint usage — these may need extra support in the classroom.
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-600" />
                  Best Practices for Classroom Integration
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Assign specific topics as homework and review the analytics the next day</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Use the platform's practice tests as formative assessments before exams</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Encourage friendly competition using the class leaderboard</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Review class-wide weak topics to inform your lesson planning</li>
                  <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Pair struggling students with higher-performing peers for collaborative practice</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="ai-training" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-purple-100 p-3 rounded-full">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AI Training Data Outline</h2>
            </div>

            <p className="text-gray-600 mb-4 text-lg">
              To continuously improve the quality of AI-generated questions and tutoring responses, our models require structured training data aligned with Caribbean curricula. Below is an outline of what is needed for SEA and CSEC Mathematics.
            </p>
            <p className="text-gray-600 mb-8 text-sm italic">
              This section is intended for educators, curriculum specialists, and contributors who want to help improve the platform's AI capabilities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">SEA Mathematics</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Secondary Entrance Assessment — Standard 4-5 level</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Curriculum Documents Needed</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Official SEA Mathematics syllabus (Ministry of Education)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Standard 4 and Standard 5 mathematics textbooks</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> SEA content specifications and learning outcomes by strand</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Past Papers & Questions</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Past SEA exam papers (5-10 years minimum)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Mock exam papers from schools and publishers</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Worked solutions with step-by-step explanations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Question Types & Topics</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Number operations (whole numbers, fractions, decimals)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Measurement (length, mass, capacity, time, money)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Geometry (shapes, symmetry, angles, area, perimeter)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Statistics (data collection, bar graphs, pictographs)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Problem solving and word problems</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Marking Schemes</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Official marking schemes showing partial credit allocation</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Common student errors and misconceptions per topic</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Acceptable alternative solution methods</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">CSEC Mathematics</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Caribbean Secondary Education Certificate — Form 4-5 level</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Curriculum Documents Needed</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> CXC CSEC Mathematics syllabus (latest edition)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Specimen papers and suggested mark allocations</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> CXC study guides and approved textbooks</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Past Papers & Questions</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Past CSEC papers: Paper 01 (MCQ) and Paper 02 (structured)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> At least 10 years of past papers with solutions</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> School-level mock exams and teacher-generated questions</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Question Types & Topics</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Number theory (sets, number bases, indices)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Consumer arithmetic (profit/loss, interest, tax)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Algebra (equations, inequalities, functions, graphs)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Geometry and trigonometry (circle theorems, bearings, vectors)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Statistics and probability (mean, median, mode, cumulative frequency)</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Matrices, transformations, and coordinate geometry</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Marking Schemes</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> CXC official mark schemes with method marks and accuracy marks</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Common errors documented by CXC examiners' reports</li>
                      <li className="flex items-start gap-2"><ClipboardList className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /> Grade boundary information (Profiles I, II, III)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                How Training Data Improves the AI
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                The training data outlined above is used to fine-tune and evaluate our AI models in several ways:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> <strong>Question Generation:</strong> Past papers and question banks teach the AI to create new, original questions that match the style, difficulty, and topic distribution of real exams.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> <strong>Hint Quality:</strong> Worked solutions and marking schemes help the AI produce better step-by-step hints that mirror how experienced teachers explain concepts.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> <strong>Error Detection:</strong> Common misconceptions from examiner reports allow the AI to recognise typical student mistakes and provide targeted feedback.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" /> <strong>Difficulty Calibration:</strong> Grade boundary data and syllabus specifications ensure questions are calibrated to the appropriate difficulty for each grade level.</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                If you are an educator, curriculum developer, or content contributor interested in helping improve our AI models, we'd love to hear from you.
              </p>
              <Link to="/contact-us">
                <Button size="lg" variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
