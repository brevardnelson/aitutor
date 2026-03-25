import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Percent, Divide, Plus, Hash, Square, RotateCcw, Triangle, Ruler, Grid3X3, Box, Clock, Compass, Move, Beaker, Timer, BookOpen, PenTool, MessageSquare, FileText, Headphones, Eye, Edit3, Users, Globe, Sparkles, TrendingUp, ShoppingCart, CircleDot, BarChart3, Network, Star, Sliders, ArrowLeftRight, Layers, GitFork, Infinity, Activity, FlipHorizontal, Workflow } from 'lucide-react';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  subject?: string;
}

const mathTopics = [
  {
    id: 'Whole Number Operations',
    name: 'Whole Number Operations',
    description: 'Addition, Subtraction, Multiplication, Division',
    icon: Calculator,
    difficulty: 'Beginner',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'Fractions',
    name: 'Fractions',
    description: 'Learn to add, subtract, multiply and divide fractions',
    icon: Divide,
    difficulty: 'Beginner',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'Decimals',
    name: 'Decimals',
    description: 'Master decimal operations and conversions',
    icon: Hash,
    difficulty: 'Beginner',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'Percentages',
    name: 'Percentages',
    description: 'Calculate percentages, discounts, and increases',
    icon: Percent,
    difficulty: 'Intermediate',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'Number Patterns',
    name: 'Number Patterns',
    description: 'Identify and continue number sequences',
    icon: RotateCcw,
    difficulty: 'Intermediate',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'Basic Algebra',
    name: 'Basic Algebra',
    description: 'Solve equations and work with variables',
    icon: X,
    difficulty: 'Intermediate',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'Word Problems',
    name: 'Word Problems',
    description: 'Apply math skills to real-world scenarios',
    icon: Plus,
    difficulty: 'Advanced',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'Solids and Plane Shapes',
    name: 'Solids and Plane Shapes',
    description: 'Learn about 2D and 3D shapes',
    icon: Box,
    difficulty: 'Beginner',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'Geometry Basics',
    name: 'Geometry Basics',
    description: 'Learn about shapes, area, and perimeter',
    icon: Triangle,
    difficulty: 'Intermediate',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'Symmetry',
    name: 'Symmetry',
    description: 'Understand lines of symmetry and reflection',
    icon: Move,
    difficulty: 'Intermediate',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'Angles',
    name: 'Angles',
    description: 'Measure and classify different types of angles',
    icon: Compass,
    difficulty: 'Intermediate',
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'Linear Measure',
    name: 'Linear Measure',
    description: 'Learn about length, distance, and measurement',
    icon: Ruler,
    difficulty: 'Beginner',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'Area',
    name: 'Area',
    description: 'Calculate area of various shapes',
    icon: Square,
    difficulty: 'Intermediate',
    color: 'from-lime-500 to-lime-600'
  },
  {
    id: 'Volume, Capacity & Mass',
    name: 'Volume, Capacity & Mass',
    description: 'Understand 3D measurements and weight',
    icon: Beaker,
    difficulty: 'Advanced',
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'Time',
    name: 'Time',
    description: 'Read clocks, calculate duration, and time problems',
    icon: Clock,
    difficulty: 'Beginner',
    color: 'from-sky-500 to-sky-600'
  }
];

const englishTopics = [
  {
    id: 'Reading Comprehension',
    name: 'Reading Comprehension',
    description: 'Understand texts, identify main ideas and supporting details',
    icon: BookOpen,
    difficulty: 'Beginner',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'Vocabulary Development',
    name: 'Vocabulary Development',
    description: 'Learn new words, synonyms, antonyms, and context clues',
    icon: Sparkles,
    difficulty: 'Beginner',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'Grammar & Syntax',
    name: 'Grammar & Syntax',
    description: 'Master parts of speech, sentence structure, and grammar rules',
    icon: Edit3,
    difficulty: 'Intermediate',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'Writing Skills',
    name: 'Writing Skills',
    description: 'Develop paragraphs, essays, and creative writing',
    icon: PenTool,
    difficulty: 'Intermediate',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'Listening Comprehension',
    name: 'Listening Comprehension',
    description: 'Understand spoken English and follow instructions',
    icon: Headphones,
    difficulty: 'Beginner',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'Speaking & Pronunciation',
    name: 'Speaking & Pronunciation',
    description: 'Practice speaking clearly and pronouncing words correctly',
    icon: MessageSquare,
    difficulty: 'Intermediate',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'Poetry & Literature',
    name: 'Poetry & Literature',
    description: 'Analyze poems, stories, and literary devices',
    icon: FileText,
    difficulty: 'Advanced',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'Comprehension Strategies',
    name: 'Comprehension Strategies',
    description: 'Learn techniques for better understanding of texts',
    icon: Eye,
    difficulty: 'Intermediate',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'Punctuation & Capitalization',
    name: 'Punctuation & Capitalization',
    description: 'Master proper use of punctuation marks and capitals',
    icon: Hash,
    difficulty: 'Beginner',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'Spelling Patterns',
    name: 'Spelling Patterns',
    description: 'Learn spelling rules and common word patterns',
    icon: Grid3X3,
    difficulty: 'Beginner',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'Communication Skills',
    name: 'Communication Skills',
    description: 'Practice effective verbal and written communication',
    icon: Users,
    difficulty: 'Intermediate',
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'Caribbean Literature',
    name: 'Caribbean Literature',
    description: 'Explore Caribbean authors, culture, and literary traditions',
    icon: Globe,
    difficulty: 'Advanced',
    color: 'from-amber-500 to-amber-600'
  }
];

const scienceTopics = [
  {
    id: 'Basic Biology',
    name: 'Basic Biology',
    description: 'Living organisms, plants, animals, and human body systems',
    icon: Beaker,
    difficulty: 'Beginner',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'Chemistry Fundamentals',
    name: 'Chemistry Fundamentals',
    description: 'Elements, compounds, mixtures, and chemical reactions',
    icon: Timer,
    difficulty: 'Intermediate',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'Physics Basics',
    name: 'Physics Basics',
    description: 'Motion, forces, energy, and simple machines',
    icon: Compass,
    difficulty: 'Intermediate',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'Earth Science',
    name: 'Earth Science',
    description: 'Weather, climate, rocks, minerals, and Earth processes',
    icon: Globe,
    difficulty: 'Beginner',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'Scientific Method',
    name: 'Scientific Method',
    description: 'Observation, hypothesis, experimentation, and analysis',
    icon: Eye,
    difficulty: 'Advanced',
    color: 'from-red-500 to-red-600'
  }
];

const csecMathTopics = [
  // Module 1
  {
    id: 'CSEC: Number Theory',
    name: 'Number Theory',
    description: 'Scientific notation, HCF/LCM, ratio, sequences, real numbers',
    icon: Hash,
    difficulty: 'Form 4',
    color: 'from-blue-600 to-blue-700',
    module: 'Module 1'
  },
  {
    id: 'CSEC: Consumer Arithmetic',
    name: 'Consumer Arithmetic',
    description: 'Profit/loss, simple & compound interest, hire purchase, tax',
    icon: ShoppingCart,
    difficulty: 'Form 4',
    color: 'from-green-600 to-green-700',
    module: 'Module 1'
  },
  {
    id: 'CSEC: Sets',
    name: 'Sets',
    description: 'Venn diagrams, intersection, union, complement, set notation',
    icon: CircleDot,
    difficulty: 'Form 4',
    color: 'from-purple-600 to-purple-700',
    module: 'Module 1'
  },
  {
    id: 'CSEC: Measurement',
    name: 'Measurement',
    description: 'Surface area, volume, sectors, speed-distance-time, scale',
    icon: Ruler,
    difficulty: 'Form 4',
    color: 'from-orange-600 to-orange-700',
    module: 'Module 1'
  },
  {
    id: 'CSEC: Algebra 1',
    name: 'Algebra 1',
    description: 'Indices, expansion, factorisation, inequalities, formulae',
    icon: Calculator,
    difficulty: 'Form 4',
    color: 'from-red-600 to-red-700',
    module: 'Module 1'
  },
  {
    id: 'CSEC: Introduction to Graphs',
    name: 'Linear Graphs',
    description: 'Gradient, intercepts, equation of a line, parallel & perpendicular',
    icon: TrendingUp,
    difficulty: 'Form 4',
    color: 'from-teal-600 to-teal-700',
    module: 'Module 1'
  },
  // Module 2
  {
    id: 'CSEC: Statistics 1',
    name: 'Statistics 1',
    description: 'Mean, median, mode, range, IQR, bar charts, probability',
    icon: BarChart3,
    difficulty: 'Form 4',
    color: 'from-cyan-600 to-cyan-700',
    module: 'Module 2'
  },
  {
    id: 'CSEC: Algebra 2',
    name: 'Algebra 2',
    description: 'Quadratics, simultaneous equations, completing the square, variation',
    icon: Activity,
    difficulty: 'Form 5',
    color: 'from-indigo-600 to-indigo-700',
    module: 'Module 2'
  },
  {
    id: 'CSEC: Functions and Graphs',
    name: 'Functions & Graphs',
    description: 'Functions, inverse, composite, quadratic graphs, axes of symmetry',
    icon: GitFork,
    difficulty: 'Form 5',
    color: 'from-violet-600 to-violet-700',
    module: 'Module 2'
  },
  {
    id: 'CSEC: Geometry and Trigonometry',
    name: 'Geometry & Trigonometry',
    description: 'Pythagoras, SOHCAHTOA, sine/cosine rule, angles of elevation',
    icon: Triangle,
    difficulty: 'Form 5',
    color: 'from-amber-600 to-amber-700',
    module: 'Module 2'
  },
  {
    id: 'CSEC: Vectors and Matrices',
    name: 'Vectors & Matrices',
    description: 'Vector algebra, magnitude, matrix operations, vector geometry',
    icon: Network,
    difficulty: 'Form 5',
    color: 'from-rose-600 to-rose-700',
    module: 'Module 2'
  },
  // Module 3
  {
    id: 'CSEC: Statistics 2',
    name: 'Statistics 2',
    description: 'Grouped data, histograms, ogive, combined probability',
    icon: Sliders,
    difficulty: 'Form 5',
    color: 'from-sky-600 to-sky-700',
    module: 'Module 3'
  },
  {
    id: 'CSEC: Linear Programming',
    name: 'Linear Programming',
    description: 'Feasible regions, constraints, maximise/minimise objective functions',
    icon: Layers,
    difficulty: 'Form 5',
    color: 'from-emerald-600 to-emerald-700',
    module: 'Module 3'
  },
  {
    id: 'CSEC: Circle Theorems',
    name: 'Circle Theorems',
    description: 'Angles in circles, cyclic quadrilaterals, tangent properties',
    icon: Star,
    difficulty: 'Form 5',
    color: 'from-pink-600 to-pink-700',
    module: 'Module 3'
  },
  {
    id: 'CSEC: Transformations',
    name: 'Transformations',
    description: 'Reflection, rotation, translation, enlargement in the plane',
    icon: ArrowLeftRight,
    difficulty: 'Form 5',
    color: 'from-lime-600 to-lime-700',
    module: 'Module 3'
  },
  {
    id: 'CSEC: Matrices 2',
    name: 'Matrices & Transformations',
    description: 'Determinants, inverse matrices, transformation matrices',
    icon: Grid3X3,
    difficulty: 'Form 5',
    color: 'from-fuchsia-600 to-fuchsia-700',
    module: 'Module 3'
  }
];

const getTopicsForSubject = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'english':
      return englishTopics;
    case 'science':
      return scienceTopics;
    case 'math':
    default:
      return mathTopics;
  }
};

const CSEC_MODULE_LABELS: Record<string, string> = {
  'Module 1': 'Module 1 — Fundamentals',
  'Module 2': 'Module 2 — Intermediate',
  'Module 3': 'Module 3 — Higher Concepts',
};

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, subject = 'math' }) => {
  const [mode, setMode] = useState<'general' | 'csec'>('general');
  const generalTopics = getTopicsForSubject(subject);
  const isMath = subject.toLowerCase() === 'math';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      case 'Form 4': return 'bg-blue-100 text-blue-800';
      case 'Form 5': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTopicCard = (topic: { id: string; name: string; description: string; icon: React.ElementType; difficulty: string; color: string }) => {
    const IconComponent = topic.icon;
    return (
      <Card
        key={topic.id}
        className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        onClick={() => onTopicSelect(topic.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`bg-gradient-to-r ${topic.color} p-3 rounded-full group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <Badge className={getDifficultyColor(topic.difficulty)}>
              {topic.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
            {topic.name}
          </CardTitle>
          <CardDescription className="text-sm">
            {topic.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-2 text-center">
            <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
              Click to start learning →
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Group CSEC topics by module
  const csecByModule: Record<string, typeof csecMathTopics> = {};
  csecMathTopics.forEach(t => {
    const mod = (t as { module?: string }).module || 'Module 1';
    if (!csecByModule[mod]) csecByModule[mod] = [];
    csecByModule[mod].push(t);
  });

  return (
    <div>
      {isMath && (
        <div className="flex gap-3 mb-6">
          <Button
            variant={mode === 'general' ? 'default' : 'outline'}
            onClick={() => setMode('general')}
            className="rounded-full"
          >
            Primary & Junior Secondary
          </Button>
          <Button
            variant={mode === 'csec' ? 'default' : 'outline'}
            onClick={() => setMode('csec')}
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
          >
            CSEC Mathematics (Form 4–5)
          </Button>
        </div>
      )}

      {isMath && mode === 'csec' ? (
        <div className="space-y-8">
          {Object.entries(csecByModule).map(([mod, topics]) => (
            <div key={mod}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-200 to-purple-200" />
                <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {CSEC_MODULE_LABELS[mod] || mod}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-blue-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {topics.map(renderTopicCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalTopics.map(renderTopicCard)}
        </div>
      )}
    </div>
  );
};

export default TopicSelector;