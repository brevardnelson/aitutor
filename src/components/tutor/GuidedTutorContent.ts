// Topic-specific question banks for guided practice
export const guidedTutorContent = {
  'Whole Number Operations': {
    questions: [
      {
        problem: 'Solve: 347 + 289',
        steps: [
          'Line up the numbers by place value',
          'Add ones: 7 + 9 = 16, write 6 carry 1',
          'Add tens: 4 + 8 + 1 = 13, write 3 carry 1',
          'Add hundreds: 3 + 2 + 1 = 6',
          'Answer: 636'
        ],
        hints: [
          'Always start adding from the rightmost column',
          'Remember to carry over when the sum is 10 or more',
          'Check your work by adding in reverse order'
        ],
        correctAnswer: '636'
      },
      {
        problem: 'Solve: 504 - 267',
        steps: [
          'Line up numbers by place value',
          'Ones: 4 - 7, need to borrow from tens',
          'Borrow: 14 - 7 = 7',
          'Tens: 9 - 6 = 3 (after borrowing)',
          'Hundreds: 4 - 2 = 2',
          'Answer: 237'
        ],
        hints: [
          'When you cannot subtract, borrow from the next column',
          'Remember to reduce the column you borrowed from',
          'Check by adding: 237 + 267 should equal 504'
        ],
        correctAnswer: '237'
      },
      {
        problem: 'Solve: 24 × 15',
        steps: [
          'Multiply 24 × 5 = 120',
          'Multiply 24 × 10 = 240',
          'Add the partial products: 120 + 240 = 360'
        ],
        hints: [
          'Break down 15 into 10 + 5',
          'Multiply by each part separately',
          'Add the results together'
        ],
        correctAnswer: '360'
      }
    ]
  },
  'Number Patterns': {
    questions: [
      {
        problem: 'Find the next number in the pattern: 2, 5, 8, 11, ?',
        steps: [
          'Find the difference between consecutive numbers',
          '5 - 2 = 3, 8 - 5 = 3, 11 - 8 = 3',
          'The pattern adds 3 each time',
          'Next number: 11 + 3 = 14'
        ],
        hints: [
          'Look for what changes between each number',
          'This is an arithmetic sequence',
          'The common difference is 3'
        ],
        correctAnswer: '14'
      },
      {
        problem: 'Complete the pattern: 1, 4, 9, 16, ?',
        steps: [
          'Recognize this as perfect squares',
          '1 = 1², 4 = 2², 9 = 3², 16 = 4²',
          'Next would be 5²',
          '5² = 25'
        ],
        hints: [
          'These are square numbers',
          'Each number is a perfect square',
          '1×1, 2×2, 3×3, 4×4, then 5×5'
        ],
        correctAnswer: '25'
      }
    ]
  },
  'Solids and Plane Shapes': {
    questions: [
      {
        problem: 'How many faces does a cube have?',
        steps: [
          'A cube is a 3D shape with square faces',
          'Count all the surfaces: top, bottom, front, back, left, right',
          'Total faces = 6'
        ],
        hints: [
          'Think of a dice - that\'s a cube',
          'Each face is a square',
          'Count all the flat surfaces'
        ],
        correctAnswer: '6'
      },
      {
        problem: 'How many sides does a hexagon have?',
        steps: [
          'A hexagon is a polygon',
          'The prefix "hex" means six',
          'A hexagon has 6 sides'
        ],
        hints: [
          'Think of the prefix: hex = 6',
          'Like a stop sign, but with 6 sides instead of 8',
          'Count the straight edges around the shape'
        ],
        correctAnswer: '6'
      }
    ]
  },
  'Symmetry': {
    questions: [
      {
        problem: 'How many lines of symmetry does a square have?',
        steps: [
          'A line of symmetry divides a shape into identical halves',
          'Square has: vertical line through center',
          'Horizontal line through center',
          'Two diagonal lines through center',
          'Total: 4 lines of symmetry'
        ],
        hints: [
          'Try folding a square different ways',
          'If both halves match exactly, it\'s a line of symmetry',
          'Consider vertical, horizontal, and diagonal lines'
        ],
        correctAnswer: '4'
      }
    ]
  },
  'Angles': {
    questions: [
      {
        problem: 'What type of angle is 90 degrees?',
        steps: [
          'An angle of exactly 90° is special',
          'It forms a perfect corner',
          'This is called a right angle'
        ],
        hints: [
          'Think of the corner of a square',
          'It\'s neither acute nor obtuse',
          'Forms an "L" shape'
        ],
        correctAnswer: 'right angle'
      },
      {
        problem: 'If one angle in a triangle is 60° and another is 70°, what is the third angle?',
        steps: [
          'All angles in a triangle add up to 180°',
          'Add the known angles: 60° + 70° = 130°',
          'Subtract from 180°: 180° - 130° = 50°'
        ],
        hints: [
          'The sum of angles in any triangle is always 180°',
          'Add up what you know first',
          'The remaining amount is your answer'
        ],
        correctAnswer: '50'
      }
    ]
  },
  'Linear Measure': {
    questions: [
      {
        problem: 'Convert 3 meters to centimeters',
        steps: [
          'Know that 1 meter = 100 centimeters',
          'Multiply: 3 × 100 = 300',
          '3 meters = 300 centimeters'
        ],
        hints: [
          'When converting to smaller units, multiply',
          'Centi means 100th, so 100 cm = 1 m',
          'Think: 3 meter sticks = 300 cm'
        ],
        correctAnswer: '300'
      }
    ]
  },
  'Area': {
    questions: [
      {
        problem: 'Find the area of a triangle with base 10 cm and height 6 cm',
        steps: [
          'Use the formula: Area = (1/2) × base × height',
          'Substitute: Area = (1/2) × 10 × 6',
          'Calculate: Area = (1/2) × 60 = 30 square cm'
        ],
        hints: [
          'Triangle area is half of rectangle area',
          'Always multiply by 1/2 for triangles',
          'Units are square centimeters'
        ],
        correctAnswer: '30'
      }
    ]
  },
  'Volume, Capacity & Mass': {
    questions: [
      {
        problem: 'A box is 4 cm long, 3 cm wide, and 2 cm high. What is its volume?',
        steps: [
          'Use the formula: Volume = length × width × height',
          'Substitute: Volume = 4 × 3 × 2',
          'Calculate: Volume = 24 cubic cm'
        ],
        hints: [
          'Volume measures how much space inside',
          'Multiply all three dimensions',
          'Units are cubic centimeters'
        ],
        correctAnswer: '24'
      }
    ]
  },
  'Time': {
    questions: [
      {
        problem: 'How many minutes are in 2.5 hours?',
        steps: [
          'Know that 1 hour = 60 minutes',
          'Calculate 2.5 × 60',
          '2.5 × 60 = 150 minutes'
        ],
        hints: [
          '0.5 hours is half an hour = 30 minutes',
          '2 hours = 120 minutes',
          'Add: 120 + 30 = 150 minutes'
        ],
        correctAnswer: '150'
      }
    ]
  },
  'Fractions': {
    questions: [
      {
        problem: 'Solve: 3/4 + 1/8',
        steps: [
          'Find a common denominator for 3/4 and 1/8',
          'Convert 3/4 to eighths: 3/4 = 6/8',
          'Add the fractions: 6/8 + 1/8 = 7/8'
        ],
        hints: [
          'The least common multiple of 4 and 8 is 8',
          'To convert 3/4 to eighths, multiply both numerator and denominator by 2',
          'When denominators are the same, just add the numerators'
        ],
        correctAnswer: '7/8'
      }
    ]
  },
  'Decimals': {
    questions: [
      {
        problem: 'Solve: 2.5 × 1.4',
        steps: [
          'Multiply as if they were whole numbers: 25 × 14',
          'Calculate: 25 × 14 = 350',
          'Count decimal places: 2.5 has 1, 1.4 has 1, total is 2',
          'Place decimal point: 350 becomes 3.50 or 3.5'
        ],
        hints: [
          'Ignore the decimal points at first and multiply 25 × 14',
          'Count the total number of decimal places in both numbers',
          'Place the decimal point that many places from the right'
        ],
        correctAnswer: '3.5'
      }
    ]
  },
  'Percentages': {
    questions: [
      {
        problem: 'Find 25% of 80',
        steps: [
          'Convert percentage to decimal: 25% = 0.25',
          'Multiply: 0.25 × 80',
          'Calculate: 0.25 × 80 = 20'
        ],
        hints: [
          'To convert percentage to decimal, divide by 100',
          'Of means multiplication in math',
          '25% is the same as 1/4, so you can also divide 80 by 4'
        ],
        correctAnswer: '20'
      }
    ]
  },
  'Basic Algebra': {
    questions: [
      {
        problem: 'Solve for x: 2x + 5 = 13',
        steps: [
          'Subtract 5 from both sides: 2x + 5 - 5 = 13 - 5',
          'Simplify: 2x = 8',
          'Divide both sides by 2: x = 4'
        ],
        hints: [
          'Use inverse operations to isolate x',
          'What you do to one side, you must do to the other',
          'Check your answer by substituting back into the original equation'
        ],
        correctAnswer: '4'
      }
    ]
  },
  'Word Problems': {
    questions: [
      {
        problem: 'Sarah has 24 apples. She gives away 1/3 of them. How many apples does she have left?',
        steps: [
          'Find 1/3 of 24: 24 ÷ 3 = 8',
          'Subtract from original amount: 24 - 8 = 16'
        ],
        hints: [
          'To find a fraction of a number, multiply or divide',
          '1/3 of 24 means 24 ÷ 3',
          'She keeps the remaining apples after giving some away'
        ],
        correctAnswer: '16'
      }
    ]
  },
  'Geometry Basics': {
    questions: [
      {
        problem: 'Find the area of a rectangle with length 8 cm and width 5 cm',
        steps: [
          'Use the formula: Area = length × width',
          'Substitute values: Area = 8 × 5',
          'Calculate: Area = 40 square cm'
        ],
        hints: [
          'Area of rectangle = length × width',
          'Make sure to include the correct units in your answer',
          'Area is always measured in square units'
        ],
        correctAnswer: '40'
      }
    ]
  }
};

export type TopicKey = keyof typeof guidedTutorContent;

// Function to get a random question for a topic
export const getRandomQuestion = (topic: TopicKey) => {
  const questions = guidedTutorContent[topic]?.questions || [];
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
};