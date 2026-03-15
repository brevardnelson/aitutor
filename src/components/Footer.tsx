import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">Caribbean AI Tutor</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering Caribbean students with AI-powered personalized learning, aligned to local curricula and exam preparation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/our-story" className="text-sm hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-white transition-colors">
                  About AI Tutor
                </Link>
              </li>
              <li>
                <Link to="/?signup=true" className="text-sm hover:text-white transition-colors">
                  Sign Up for Free
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get Started</h3>
            <p className="text-sm text-gray-400 mb-4">
              Join thousands of Caribbean students improving their grades with personalized AI tutoring.
            </p>
            <Link
              to="/?signup=true"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Made available through support from the Nelsonian Foundation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
