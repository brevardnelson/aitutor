import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Globe, Users, GraduationCap, Lightbulb, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

const OurStory = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Caribbean AI Tutor</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/?signup=true">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              How a simple idea became a mission to transform education across the Caribbean.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">Where It All Began</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                Caribbean AI Tutor was born from a deeply personal observation: across the Caribbean, countless bright and eager students struggle not because they lack ability, but because they lack access. Access to qualified tutors, affordable learning materials, and consistent educational support. In many communities, private tutoring is a privilege reserved for those who can afford it, leaving behind the very students who need it most.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                At Nelsonian Solutions, we saw an opportunity to change this. We asked ourselves: what if every child in the Caribbean — whether in bustling Port of Spain, rural Jamaica, or the smaller islands of the Eastern Caribbean — could have a patient, knowledgeable tutor available 24 hours a day, 7 days a week? A tutor that never gets tired, never loses patience, and adapts to each student's unique learning pace?
              </p>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <Lightbulb className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">Our Approach</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                We built Caribbean AI Tutor using the Socratic teaching method — the same approach used by the world's best educators. Instead of simply giving students answers, our AI guides them through problems step by step, asking thoughtful questions that build genuine understanding. When a student is stuck, the tutor doesn't just reveal the answer; it offers carefully crafted hints that nudge them toward discovering the solution themselves.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Most importantly, our platform is built specifically for Caribbean students. Our content is aligned with the curricula that matter here: Common Entrance, the Secondary Entrance Assessment (SEA), CSEC, and CAPE. We understand that a Standard 5 student preparing for SEA has very different needs than a Form 4 student preparing for CSEC, and our AI adjusts accordingly — from the difficulty of questions to the language and vocabulary used.
              </p>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                We believe that a child's postcode should not determine their potential. Every child in the Caribbean deserves the chance to excel academically, regardless of their family's financial situation or where they live. Technology has the power to level this playing field, and that is exactly what we intend to do.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our mission is simple: to use artificial intelligence to deliver high-quality, personalized education to every Caribbean student who needs it. We want to be the bridge between a child's curiosity and their academic success — making learning engaging, accessible, and effective for all.
              </p>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">For Parents and Teachers</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                We know that parents and teachers are essential partners in every child's learning journey. That's why we've built comprehensive dashboards that let parents track their children's progress in real time — seeing which topics they've mastered, where they need more practice, and how they're progressing toward their exam goals. Teachers can monitor entire classrooms, identify students who may be falling behind, and use data-driven insights to inform their teaching.
              </p>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <GraduationCap className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">Looking Ahead</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">
                We're just getting started. Today we focus on Mathematics — the subject that most students across the Caribbean find challenging. But our vision is much bigger. We plan to expand into English Language Arts, Science, Social Studies, and every subject that Caribbean students need to succeed. We're building partnerships with schools, ministries of education, and community organizations to ensure that Caribbean AI Tutor reaches the students who need it most.
              </p>
              <p className="text-gray-600 leading-relaxed mb-12">
                This is more than a technology project. This is about creating opportunity, building confidence, and empowering the next generation of Caribbean leaders, thinkers, and innovators. We invite you to join us on this journey.
              </p>
            </div>

            <div className="text-center border-t pt-8">
              <p className="text-gray-500 mb-4 italic">
                "Every child deserves a chance to shine. We're here to light the way."
              </p>
              <p className="text-sm font-semibold text-gray-700">— The Nelsonian Solutions Team</p>
              <div className="mt-8">
                <Link to="/?signup=true">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Your Child's Journey Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OurStory;
