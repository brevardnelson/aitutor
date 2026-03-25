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
  },

  // ── CSEC Module 1 ──────────────────────────────────────────────────────────
  'CSEC: Number Theory': {
    questions: [
      {
        problem: 'Express 0.000427 in standard form (scientific notation).',
        steps: [
          'Move the decimal point until you have a number between 1 and 10',
          '0.000427 → 4.27 (moved 4 places to the right)',
          'Because we moved right, the power of 10 is negative: 10⁻⁴',
          'Answer: 4.27 × 10⁻⁴'
        ],
        hints: [
          'Standard form is a × 10ⁿ where 1 ≤ a < 10',
          'Count how many places the decimal moves',
          'Moving right gives a negative power; moving left gives a positive power'
        ],
        correctAnswer: '4.27 × 10⁻⁴'
      },
      {
        problem: 'Find the HCF and LCM of 36 and 48.',
        steps: [
          'Prime factorise 36: 36 = 2² × 3²',
          'Prime factorise 48: 48 = 2⁴ × 3',
          'HCF = product of lowest powers of common factors = 2² × 3 = 12',
          'LCM = product of highest powers of all factors = 2⁴ × 3² = 144'
        ],
        hints: [
          'Write each number as a product of prime factors',
          'HCF uses the smallest power of each shared prime',
          'LCM uses the largest power of every prime that appears'
        ],
        correctAnswer: 'HCF = 12, LCM = 144'
      },
      {
        problem: 'Order these numbers from smallest to largest: 1.1, 7/2, √2, 1.45, π',
        steps: [
          'Convert all to decimals: 1.1, 3.5, 1.414…, 1.45, 3.14159…',
          'Compare: 1.1 < √2 (1.414) < 1.45 < π (3.14) < 7/2 (3.5)',
          'Answer: 1.1, √2, 1.45, π, 7/2'
        ],
        hints: [
          '√2 ≈ 1.414, π ≈ 3.14159',
          'Convert fractions and surds to decimals to compare easily',
          'Line them up on a number line in your head'
        ],
        correctAnswer: '1.1, √2, 1.45, π, 7/2'
      },
      {
        problem: 'Divide $450 in the ratio 2 : 3 : 5.',
        steps: [
          'Find the total number of parts: 2 + 3 + 5 = 10',
          'Value of 1 part: $450 ÷ 10 = $45',
          'First share: 2 × $45 = $90',
          'Second share: 3 × $45 = $135',
          'Third share: 5 × $45 = $225',
          'Check: $90 + $135 + $225 = $450 ✓'
        ],
        hints: [
          'Add all parts of the ratio first',
          'Divide the total by the sum to find one part',
          'Multiply each ratio number by one part'
        ],
        correctAnswer: '$90, $135, $225'
      }
    ]
  },
  'CSEC: Consumer Arithmetic': {
    questions: [
      {
        problem: 'A store buys a TV for $1,800 and sells it at a profit of 25%. What is the selling price?',
        steps: [
          'Profit = 25% of cost price = 25/100 × $1,800 = $450',
          'Selling price = cost price + profit = $1,800 + $450 = $2,250',
          'Alternatively: selling price = 125% of cost price = 1.25 × $1,800 = $2,250'
        ],
        hints: [
          '25% profit means selling price = 125% of cost price',
          'Profit = selling price − cost price',
          'Multiply the cost price by 1.25 for a 25% markup'
        ],
        correctAnswer: '$2,250'
      },
      {
        problem: 'A bicycle bought for $600 is sold for $510. Calculate the percentage loss.',
        steps: [
          'Loss = cost price − selling price = $600 − $510 = $90',
          'Percentage loss = (loss / cost price) × 100',
          '= ($90 / $600) × 100 = 15%'
        ],
        hints: [
          'Percentage loss is always calculated on the cost price',
          'Loss = cost price − selling price (when selling price is lower)',
          'Percentage = (part / whole) × 100'
        ],
        correctAnswer: '15%'
      },
      {
        problem: 'Calculate the simple interest on $5,000 invested at 6% per annum for 3 years. What is the total amount?',
        steps: [
          'Formula: I = PRT/100, where P = principal, R = rate, T = time',
          'I = (5000 × 6 × 3) / 100 = 90000 / 100 = $900',
          'Total amount = principal + interest = $5,000 + $900 = $5,900'
        ],
        hints: [
          'Simple interest formula: I = PRT/100',
          'P = $5,000, R = 6%, T = 3 years',
          'Amount = Principal + Interest'
        ],
        correctAnswer: '$900 interest; $5,900 total amount'
      },
      {
        problem: 'A laptop costs $2,000 cash. On hire purchase it requires a $400 deposit plus 12 monthly payments of $160. How much extra is paid on hire purchase?',
        steps: [
          'Total hire purchase cost = deposit + (monthly payments × number of months)',
          '= $400 + (12 × $160) = $400 + $1,920 = $2,320',
          'Extra paid = hire purchase price − cash price = $2,320 − $2,000 = $320'
        ],
        hints: [
          'Add the deposit to the total of all monthly payments',
          'Compare this total to the cash price',
          'The difference tells you how much extra hire purchase costs'
        ],
        correctAnswer: '$320 extra'
      },
      {
        problem: 'Find the compound interest on $8,000 at 5% per annum for 2 years, compounded annually.',
        steps: [
          'Formula: A = P(1 + r/100)ⁿ',
          'A = 8000 × (1 + 5/100)² = 8000 × (1.05)² = 8000 × 1.1025 = $8,820',
          'Compound interest = A − P = $8,820 − $8,000 = $820'
        ],
        hints: [
          'Compound interest formula: A = P(1 + r/100)ⁿ',
          '(1.05)² = 1.05 × 1.05 = 1.1025',
          'CI = Final amount − Original principal'
        ],
        correctAnswer: '$820'
      }
    ]
  },
  'CSEC: Sets': {
    questions: [
      {
        problem: 'If A = {1, 2, 3, 4, 5} and B = {3, 4, 5, 6, 7}, find (a) A ∩ B  (b) A ∪ B  (c) n(A ∪ B).',
        steps: [
          'A ∩ B (intersection) = elements in BOTH sets = {3, 4, 5}',
          'A ∪ B (union) = elements in EITHER set = {1, 2, 3, 4, 5, 6, 7}',
          'n(A ∪ B) = 7 elements',
          'Verify: n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = 5 + 5 − 3 = 7 ✓'
        ],
        hints: [
          'Intersection: only the shared elements',
          'Union: all elements from both sets (no repeats)',
          'Formula: n(A∪B) = n(A) + n(B) − n(A∩B)'
        ],
        correctAnswer: 'A∩B = {3,4,5}; A∪B = {1,2,3,4,5,6,7}; n(A∪B) = 7'
      },
      {
        problem: 'In a class of 35 students, 20 study French, 15 study Spanish, and 8 study both. How many study neither?',
        steps: [
          'Use the formula: n(F ∪ S) = n(F) + n(S) − n(F ∩ S)',
          'n(F ∪ S) = 20 + 15 − 8 = 27',
          'Students who study at least one language = 27',
          'Students who study neither = 35 − 27 = 8'
        ],
        hints: [
          'Draw a Venn diagram to visualise',
          'The overlap (both) must not be counted twice',
          'Neither = total − those who study at least one'
        ],
        correctAnswer: '8 students study neither'
      },
      {
        problem: 'U = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, A = {2, 4, 6, 8, 10}, B = {1, 2, 3, 4, 5}. Find A′ ∩ B.',
        steps: [
          'Find A′ (complement of A) = elements in U but NOT in A',
          'A′ = {1, 3, 5, 7, 9}',
          'A′ ∩ B = elements in BOTH A′ and B',
          'A′ ∩ B = {1, 3, 5}'
        ],
        hints: [
          'A′ is everything in U that is not in A',
          'Then find the intersection of A′ with B',
          'List A′ first, then pick out elements that also appear in B'
        ],
        correctAnswer: 'A′ ∩ B = {1, 3, 5}'
      }
    ]
  },
  'CSEC: Measurement': {
    questions: [
      {
        problem: 'Calculate the total surface area of a cylinder with radius 7 cm and height 10 cm. (Use π = 22/7)',
        steps: [
          'A cylinder has two circular ends and one curved surface',
          'Area of two circles = 2πr² = 2 × (22/7) × 7² = 2 × (22/7) × 49 = 2 × 154 = 308 cm²',
          'Curved surface area = 2πrh = 2 × (22/7) × 7 × 10 = 440 cm²',
          'Total surface area = 308 + 440 = 748 cm²'
        ],
        hints: [
          'TSA of cylinder = 2πr² + 2πrh',
          'Two circular ends + one rectangular curved surface',
          'Use π = 22/7 and r = 7 for easy calculation'
        ],
        correctAnswer: '748 cm²'
      },
      {
        problem: 'A car travels 240 km in 3 hours. Calculate its average speed. If it then travels a further 180 km at 90 km/h, find the total time for the whole journey.',
        steps: [
          'Average speed for first part = distance / time = 240 / 3 = 80 km/h',
          'Time for second part = distance / speed = 180 / 90 = 2 hours',
          'Total time = 3 + 2 = 5 hours'
        ],
        hints: [
          'Speed = distance ÷ time',
          'Time = distance ÷ speed',
          'Add both time periods for the total'
        ],
        correctAnswer: '80 km/h; 5 hours total'
      },
      {
        problem: 'A sector has radius 12 cm and angle 60°. Find (a) the arc length and (b) the area of the sector. (Use π = 3.14)',
        steps: [
          'Arc length = (θ/360) × 2πr = (60/360) × 2 × 3.14 × 12 = (1/6) × 75.36 = 12.56 cm',
          'Area of sector = (θ/360) × πr² = (60/360) × 3.14 × 144 = (1/6) × 452.16 = 75.36 cm²'
        ],
        hints: [
          'Arc length = (angle/360) × circumference',
          'Area of sector = (angle/360) × area of full circle',
          '60° is 1/6 of 360°, so take 1/6 of the full circle values'
        ],
        correctAnswer: 'Arc length = 12.56 cm; Area = 75.36 cm²'
      }
    ]
  },
  'CSEC: Algebra 1': {
    questions: [
      {
        problem: 'Simplify: (a) 3x² × 2x³  (b) 15a⁵ ÷ 3a²  (c) (2x²)³',
        steps: [
          '(a) Multiply coefficients and add indices: 3 × 2 = 6, x² × x³ = x⁵ → 6x⁵',
          '(b) Divide coefficients and subtract indices: 15 ÷ 3 = 5, a⁵ ÷ a² = a³ → 5a³',
          '(c) Raise both coefficient and index: 2³ = 8, (x²)³ = x⁶ → 8x⁶'
        ],
        hints: [
          'Multiplying: add the indices (powers)',
          'Dividing: subtract the indices',
          'Power of a power: multiply the indices'
        ],
        correctAnswer: '(a) 6x⁵  (b) 5a³  (c) 8x⁶'
      },
      {
        problem: 'Expand and simplify: (2x + 3)(x − 4)',
        steps: [
          'Use FOIL (First, Outer, Inner, Last)',
          'First: 2x × x = 2x²',
          'Outer: 2x × (−4) = −8x',
          'Inner: 3 × x = 3x',
          'Last: 3 × (−4) = −12',
          'Combine: 2x² − 8x + 3x − 12 = 2x² − 5x − 12'
        ],
        hints: [
          'Multiply each term in the first bracket by each term in the second',
          'Keep track of positive and negative signs',
          'Collect like terms at the end'
        ],
        correctAnswer: '2x² − 5x − 12'
      },
      {
        problem: 'Factorise completely: (a) 6x² − 9x  (b) x² − 16  (c) x² + 5x + 6',
        steps: [
          '(a) HCF of 6x² and 9x is 3x: → 3x(2x − 3)',
          '(b) Difference of two squares: x² − 4² = (x − 4)(x + 4)',
          '(c) Find two numbers that multiply to 6 and add to 5 → 2 and 3: (x + 2)(x + 3)'
        ],
        hints: [
          '(a) Look for the highest common factor first',
          '(b) a² − b² = (a − b)(a + b) is the difference of squares pattern',
          '(c) For x² + bx + c, find factors of c that add to b'
        ],
        correctAnswer: '(a) 3x(2x − 3)  (b) (x − 4)(x + 4)  (c) (x + 2)(x + 3)'
      },
      {
        problem: 'Make r the subject of the formula: A = πr²',
        steps: [
          'Divide both sides by π: A/π = r²',
          'Take the square root of both sides: √(A/π) = r',
          'Answer: r = √(A/π)'
        ],
        hints: [
          'Isolate the term containing r first',
          'Divide both sides by π to get r² alone',
          'Take the square root to get r'
        ],
        correctAnswer: 'r = √(A/π)'
      },
      {
        problem: 'Solve the inequality 3x − 4 > 2x + 1 and represent the solution on a number line.',
        steps: [
          'Subtract 2x from both sides: 3x − 2x − 4 > 1',
          'Simplify: x − 4 > 1',
          'Add 4 to both sides: x > 5',
          'On a number line: open circle at 5, arrow pointing right'
        ],
        hints: [
          'Treat an inequality like an equation, but keep the inequality sign',
          'If you multiply or divide by a negative, flip the inequality sign',
          'An open circle on the number line means the endpoint is not included'
        ],
        correctAnswer: 'x > 5'
      }
    ]
  },
  'CSEC: Introduction to Graphs': {
    questions: [
      {
        problem: 'For the line y = 2x − 6, find (a) the gradient, (b) the y-intercept, (c) the x-intercept.',
        steps: [
          '(a) The equation is in the form y = mx + c; gradient m = 2',
          '(b) y-intercept: c = −6, so the line crosses the y-axis at (0, −6)',
          '(c) x-intercept: set y = 0 → 0 = 2x − 6 → 2x = 6 → x = 3, so (3, 0)'
        ],
        hints: [
          'In y = mx + c, m is the gradient and c is the y-intercept',
          'y-intercept: substitute x = 0',
          'x-intercept: substitute y = 0 and solve for x'
        ],
        correctAnswer: '(a) m = 2  (b) (0, −6)  (c) (3, 0)'
      },
      {
        problem: 'Write the equation of the straight line passing through (1, 3) and (4, 9).',
        steps: [
          'Find the gradient: m = (y₂ − y₁)/(x₂ − x₁) = (9 − 3)/(4 − 1) = 6/3 = 2',
          'Use point-slope form: y − y₁ = m(x − x₁)',
          'y − 3 = 2(x − 1)',
          'y − 3 = 2x − 2',
          'y = 2x + 1'
        ],
        hints: [
          'Gradient = change in y ÷ change in x',
          'Substitute gradient and one point into y − y₁ = m(x − x₁)',
          'Rearrange into y = mx + c form'
        ],
        correctAnswer: 'y = 2x + 1'
      },
      {
        problem: 'Are the lines y = 3x + 2 and y = 3x − 7 parallel? Explain. What is the gradient of a line perpendicular to them?',
        steps: [
          'Both lines have gradient m = 3; parallel lines have equal gradients',
          'Yes, they are parallel because their gradients are equal',
          'Gradient of perpendicular line = −1/m = −1/3'
        ],
        hints: [
          'Parallel lines have the same gradient',
          'Perpendicular lines have gradients whose product = −1',
          'If m = 3, then the perpendicular gradient is −1/3'
        ],
        correctAnswer: 'Yes, parallel (both m = 3); perpendicular gradient = −1/3'
      }
    ]
  },
  // ── CSEC Module 2 ──────────────────────────────────────────────────────────
  'CSEC: Statistics 1': {
    questions: [
      {
        problem: 'The marks scored by 8 students are: 7, 3, 9, 7, 4, 6, 7, 5. Find the (a) mean, (b) median, (c) mode, (d) range.',
        steps: [
          'Mean: add all values and divide by 8 → (7+3+9+7+4+6+7+5)/8 = 48/8 = 6',
          'Arrange in order: 3, 4, 5, 6, 7, 7, 7, 9',
          'Median: average of 4th and 5th values = (6+7)/2 = 6.5',
          'Mode: most frequent value = 7 (appears 3 times)',
          'Range: highest − lowest = 9 − 3 = 6'
        ],
        hints: [
          'Mean = sum of all values ÷ number of values',
          'Median: sort the data first, then find the middle',
          'Mode: the value that appears most often'
        ],
        correctAnswer: 'Mean = 6; Median = 6.5; Mode = 7; Range = 6'
      },
      {
        problem: 'Find the interquartile range of: 2, 5, 7, 8, 11, 13, 15, 18.',
        steps: [
          '8 values; Lower half: 2, 5, 7, 8 → Q1 = (5+7)/2 = 6',
          'Upper half: 11, 13, 15, 18 → Q3 = (13+15)/2 = 14',
          'IQR = Q3 − Q1 = 14 − 6 = 8',
          'Semi-IQR = IQR/2 = 4'
        ],
        hints: [
          'Split the data in half to find Q1 and Q3',
          'Q1 = median of the lower half, Q3 = median of upper half',
          'IQR = Q3 − Q1'
        ],
        correctAnswer: 'IQR = 8; Semi-IQR = 4'
      },
      {
        problem: 'A bag contains 5 red, 3 blue, and 2 green marbles. Find the probability that a marble chosen at random is (a) red, (b) not red, (c) blue or green.',
        steps: [
          'Total marbles = 5 + 3 + 2 = 10',
          'P(red) = 5/10 = 1/2',
          'P(not red) = 1 − P(red) = 1 − 1/2 = 1/2',
          'P(blue or green) = (3+2)/10 = 5/10 = 1/2'
        ],
        hints: [
          'P(event) = number of favourable outcomes ÷ total outcomes',
          'P(not red) = 1 − P(red)',
          'Blue or green: add their counts together'
        ],
        correctAnswer: '(a) 1/2  (b) 1/2  (c) 1/2'
      }
    ]
  },
  'CSEC: Algebra 2': {
    questions: [
      {
        problem: 'Solve the quadratic equation x² − 5x + 6 = 0 by factorisation.',
        steps: [
          'Find two numbers that multiply to 6 and add to −5',
          'Those numbers are −2 and −3 (since −2 × −3 = 6 and −2 + −3 = −5)',
          'Factorise: (x − 2)(x − 3) = 0',
          'Either x − 2 = 0 → x = 2, or x − 3 = 0 → x = 3',
          'Solutions: x = 2 or x = 3'
        ],
        hints: [
          'Find factor pairs of the constant term (+6)',
          'Choose the pair whose sum equals the middle coefficient (−5)',
          'Set each factor equal to zero and solve'
        ],
        correctAnswer: 'x = 2 or x = 3'
      },
      {
        problem: 'Solve simultaneously: 2x + y = 8 and x − y = 1.',
        steps: [
          'Add the two equations to eliminate y: (2x + y) + (x − y) = 8 + 1',
          '3x = 9 → x = 3',
          'Substitute x = 3 into the first equation: 2(3) + y = 8 → 6 + y = 8 → y = 2',
          'Check in second equation: 3 − 2 = 1 ✓',
          'Solution: x = 3, y = 2'
        ],
        hints: [
          'Look to add or subtract equations to eliminate one variable',
          'Substitute your found value back into an original equation',
          'Always check your answer in both equations'
        ],
        correctAnswer: 'x = 3, y = 2'
      },
      {
        problem: 'Complete the square for x² + 6x − 7 and hence solve x² + 6x − 7 = 0.',
        steps: [
          'Rewrite as (x + 3)² − 9 − 7 = (x + 3)² − 16',
          'Completed square form: (x + 3)² − 16',
          'To solve: (x + 3)² − 16 = 0 → (x + 3)² = 16',
          'x + 3 = ±4',
          'x = 4 − 3 = 1 or x = −4 − 3 = −7'
        ],
        hints: [
          'Half the coefficient of x: 6/2 = 3; square it: 3² = 9',
          'Add and subtract 9 to maintain equality',
          'Take the square root of both sides (remember ±)'
        ],
        correctAnswer: '(x + 3)² − 16; x = 1 or x = −7'
      },
      {
        problem: 'y varies directly as x. When x = 4, y = 20. Find (a) the constant of variation, (b) y when x = 7, (c) x when y = 35.',
        steps: [
          'Direct variation: y = kx',
          'Find k: 20 = k × 4 → k = 5',
          'y = 5x',
          '(b) When x = 7: y = 5 × 7 = 35',
          '(c) When y = 35: 35 = 5x → x = 7'
        ],
        hints: [
          'Direct variation: y = kx (y is proportional to x)',
          'Find k using the given pair of values',
          'Use y = kx to find missing values'
        ],
        correctAnswer: '(a) k = 5  (b) y = 35  (c) x = 7'
      }
    ]
  },
  'CSEC: Functions and Graphs': {
    questions: [
      {
        problem: 'Given f(x) = 3x − 1, find (a) f(4), (b) f⁻¹(x), (c) f⁻¹(11).',
        steps: [
          '(a) f(4) = 3(4) − 1 = 12 − 1 = 11',
          '(b) Find inverse: let y = 3x − 1; swap x and y → x = 3y − 1',
          'Solve for y: 3y = x + 1 → y = (x + 1)/3',
          'So f⁻¹(x) = (x + 1)/3',
          '(c) f⁻¹(11) = (11 + 1)/3 = 12/3 = 4'
        ],
        hints: [
          'To find f(4), substitute x = 4 into the function',
          'To find the inverse: replace f(x) with y, swap x and y, then solve for y',
          'Check: f(f⁻¹(x)) should equal x'
        ],
        correctAnswer: '(a) 11  (b) f⁻¹(x) = (x+1)/3  (c) 4'
      },
      {
        problem: 'Given f(x) = 2x + 1 and g(x) = x − 3, find (a) fg(x), (b) gf(x). Are they equal?',
        steps: [
          '(a) fg(x) = f(g(x)) = f(x − 3) = 2(x − 3) + 1 = 2x − 6 + 1 = 2x − 5',
          '(b) gf(x) = g(f(x)) = g(2x + 1) = (2x + 1) − 3 = 2x − 2',
          'fg(x) = 2x − 5 ≠ gf(x) = 2x − 2; composite functions are generally not commutative'
        ],
        hints: [
          'fg(x) means apply g first, then f',
          'Substitute g(x) into f as the input',
          'fg and gf usually give different results'
        ],
        correctAnswer: '(a) fg(x) = 2x − 5  (b) gf(x) = 2x − 2  (not equal)'
      },
      {
        problem: 'For the quadratic function y = x² − 4x + 3, find (a) the roots, (b) the axis of symmetry, (c) the minimum value.',
        steps: [
          '(a) Factorise: x² − 4x + 3 = (x − 1)(x − 3) = 0 → roots: x = 1 and x = 3',
          '(b) Axis of symmetry: x = −b/2a = −(−4)/(2×1) = 4/2 = 2, so x = 2',
          '(c) Minimum value: substitute x = 2 into y = x² − 4x + 3 → y = 4 − 8 + 3 = −1',
          'Or write in completed square form: y = (x − 2)² − 1; minimum is −1 at x = 2'
        ],
        hints: [
          'Roots: factorise and set each factor to zero',
          'Axis of symmetry: x = −b/(2a)',
          'Substitute the axis of symmetry value back to find the minimum'
        ],
        correctAnswer: '(a) x = 1, x = 3  (b) x = 2  (c) minimum = −1'
      }
    ]
  },
  'CSEC: Geometry and Trigonometry': {
    questions: [
      {
        problem: 'A right triangle has legs 8 cm and 15 cm. Find (a) the hypotenuse, (b) the angle opposite the 8 cm side (to 1 decimal place).',
        steps: [
          '(a) Pythagoras: c² = 8² + 15² = 64 + 225 = 289 → c = √289 = 17 cm',
          '(b) tan θ = opposite/adjacent = 8/15',
          'θ = tan⁻¹(8/15) = tan⁻¹(0.5333…) ≈ 28.1°'
        ],
        hints: [
          'Pythagoras theorem: a² + b² = c² where c is the hypotenuse',
          'Use SOHCAHTOA to find angles',
          'tan θ = opposite/adjacent; use inverse tan (tan⁻¹) to find the angle'
        ],
        correctAnswer: '(a) 17 cm  (b) ≈ 28.1°'
      },
      {
        problem: 'From the top of a cliff 80 m high, the angle of depression to a boat is 25°. How far is the boat from the base of the cliff?',
        steps: [
          'The angle of depression from the cliff top = angle of elevation from the boat = 25°',
          'The height (opposite) = 80 m; horizontal distance = adjacent',
          'tan 25° = opposite/adjacent = 80/d',
          'd = 80/tan 25° = 80/0.4663 ≈ 171.6 m'
        ],
        hints: [
          'Draw a diagram with the cliff, the horizontal, and the boat',
          'Angle of depression from the top equals angle of elevation from the boat (alternate angles)',
          'Use tan = opposite/adjacent with the height as the opposite side'
        ],
        correctAnswer: '≈ 171.6 m'
      },
      {
        problem: 'In triangle ABC, angles A = 40°, B = 75°. Find angle C. Then, using the sine rule with BC = 10 cm, find AC.',
        steps: [
          'C = 180° − 40° − 75° = 65°',
          'Sine rule: BC/sin A = AC/sin B',
          '10/sin 40° = AC/sin 75°',
          'AC = 10 × sin 75° / sin 40°',
          'AC = 10 × 0.9659 / 0.6428 ≈ 15.0 cm'
        ],
        hints: [
          'Angles in a triangle sum to 180°',
          'Sine rule: a/sin A = b/sin B = c/sin C',
          'Cross multiply to find the unknown side'
        ],
        correctAnswer: 'C = 65°; AC ≈ 15.0 cm'
      },
      {
        problem: 'In triangle PQR, PQ = 7 cm, QR = 9 cm, and angle PQR = 120°. Find PR using the cosine rule.',
        steps: [
          'Cosine rule: PR² = PQ² + QR² − 2(PQ)(QR) cos(PQR)',
          'PR² = 7² + 9² − 2(7)(9) cos(120°)',
          'cos 120° = −0.5',
          'PR² = 49 + 81 − 126 × (−0.5) = 130 + 63 = 193',
          'PR = √193 ≈ 13.9 cm'
        ],
        hints: [
          'Cosine rule: c² = a² + b² − 2ab cos C',
          'cos 120° is negative (−0.5), so subtracting a negative adds to the sum',
          'Take the square root at the end'
        ],
        correctAnswer: 'PR ≈ 13.9 cm'
      }
    ]
  },
  'CSEC: Vectors and Matrices': {
    questions: [
      {
        problem: 'Given vectors a = (3, 4) and b = (1, −2), find (a) |a|, (b) a + b, (c) 2a − b.',
        steps: [
          '(a) |a| = √(3² + 4²) = √(9 + 16) = √25 = 5',
          '(b) a + b = (3+1, 4+(−2)) = (4, 2)',
          '(c) 2a = (6, 8); 2a − b = (6−1, 8−(−2)) = (5, 10)'
        ],
        hints: [
          'Magnitude |a| = √(x² + y²)',
          'Add vectors component by component',
          'Scalar multiplication: multiply each component by the scalar'
        ],
        correctAnswer: '(a) 5  (b) (4, 2)  (c) (5, 10)'
      },
      {
        problem: 'Given A = [[2, 1], [3, 4]] and B = [[1, 0], [2, 3]], find (a) A + B, (b) AB.',
        steps: [
          '(a) A + B = [[2+1, 1+0], [3+2, 4+3]] = [[3, 1], [5, 7]]',
          '(b) AB: Row 1 × Col 1: (2×1 + 1×2) = 4; Row 1 × Col 2: (2×0 + 1×3) = 3',
          'Row 2 × Col 1: (3×1 + 4×2) = 11; Row 2 × Col 2: (3×0 + 4×3) = 12',
          'AB = [[4, 3], [11, 12]]'
        ],
        hints: [
          'Matrix addition: add corresponding elements',
          'Matrix multiplication: row × column (multiply and sum)',
          'The (i,j) entry of AB = row i of A dotted with column j of B'
        ],
        correctAnswer: '(a) [[3,1],[5,7]]  (b) [[4,3],[11,12]]'
      },
      {
        problem: 'ABCD is a quadrilateral where AB = a, AD = b. M is the midpoint of BD. Express AM in terms of a and b.',
        steps: [
          'Let A be the origin. Then: AB⃗ = a, AD⃗ = b',
          'BD⃗ = AD⃗ − AB⃗ = b − a',
          'M is the midpoint of BD, so BM⃗ = ½(b − a)',
          'AM⃗ = AB⃗ + BM⃗ = a + ½(b − a) = a + ½b − ½a = ½a + ½b',
          'AM⃗ = ½(a + b)'
        ],
        hints: [
          'Use A as your starting point',
          'To get from A to M, go via B: AM = AB + BM',
          'BM is half of BD'
        ],
        correctAnswer: 'AM = ½(a + b)'
      }
    ]
  },
  // ── CSEC Module 3 ──────────────────────────────────────────────────────────
  'CSEC: Statistics 2': {
    questions: [
      {
        problem: 'The frequency table shows ages (grouped): 10–14: 4, 15–19: 10, 20–24: 12, 25–29: 8, 30–34: 6. Estimate the mean age.',
        steps: [
          'Find class midpoints: 12, 17, 22, 27, 32',
          'Multiply each midpoint by its frequency: 12×4=48, 17×10=170, 22×12=264, 27×8=216, 32×6=192',
          'Sum of (f × x): 48+170+264+216+192 = 890',
          'Total frequency: 4+10+12+8+6 = 40',
          'Estimated mean = 890/40 = 22.25'
        ],
        hints: [
          'Use class midpoints (middle value of each class) to estimate the mean',
          'Mean = Σ(f × x) / Σf',
          'Sum the products of frequency and midpoint, then divide by total frequency'
        ],
        correctAnswer: '22.25'
      },
      {
        problem: 'Two fair coins are tossed. Using a sample space, find the probability of getting (a) 2 heads, (b) at least 1 tail.',
        steps: [
          'Sample space: {HH, HT, TH, TT} — 4 equally likely outcomes',
          '(a) P(2 heads) = P(HH) = 1/4',
          '(b) Outcomes with at least 1 tail: HT, TH, TT = 3 outcomes',
          'P(at least 1 tail) = 3/4',
          'Or: P(at least 1 tail) = 1 − P(no tails) = 1 − 1/4 = 3/4'
        ],
        hints: [
          'List all possible outcomes in the sample space',
          'Count favourable outcomes for each event',
          '"At least 1" is the complement of "none at all"'
        ],
        correctAnswer: '(a) 1/4  (b) 3/4'
      },
      {
        problem: 'A die is rolled and a coin is flipped. Find the probability that the die shows an even number AND the coin shows heads.',
        steps: [
          'Die: even numbers are 2, 4, 6 → P(even) = 3/6 = 1/2',
          'Coin: P(heads) = 1/2',
          'These are independent events, so multiply:',
          'P(even AND heads) = 1/2 × 1/2 = 1/4'
        ],
        hints: [
          'For independent events, P(A and B) = P(A) × P(B)',
          'List even numbers on a die: 2, 4, 6',
          'Multiply the two probabilities together'
        ],
        correctAnswer: '1/4'
      }
    ]
  },
  'CSEC: Linear Programming': {
    questions: [
      {
        problem: 'A factory makes chairs (x) and tables (y). Constraints: x + y ≤ 10, y ≤ 6, x ≥ 0, y ≥ 0. Profit = $40x + $50y. Find the maximum profit.',
        steps: [
          'Identify corner points of the feasible region',
          'From x + y ≤ 10, y ≤ 6, x ≥ 0, y ≥ 0:',
          'Corner points: (0,0), (10,0), (4,6), (0,6)',
          'Evaluate profit P = 40x + 50y at each:',
          'P(0,0) = 0; P(10,0) = 400; P(4,6) = 160+300 = 460; P(0,6) = 300',
          'Maximum profit = $460 at x = 4, y = 6'
        ],
        hints: [
          'Graph the constraint lines to find the feasible region',
          'The maximum always occurs at a corner (vertex) of the feasible region',
          'Test the profit function at each corner point'
        ],
        correctAnswer: 'Maximum profit = $460 when x = 4 (chairs), y = 6 (tables)'
      },
      {
        problem: 'Write the inequalities for: "A student can spend at most 10 hours studying Maths (m) and English (e) per week. She must study at least 2 hours of each subject." Graph the feasible region.',
        steps: [
          'm + e ≤ 10 (at most 10 hours total)',
          'm ≥ 2 (at least 2 hours maths)',
          'e ≥ 2 (at least 2 hours English)',
          'Feasible region: the area where all three constraints are satisfied',
          'Corner points of feasible region: (2,2), (8,2), (2,8)'
        ],
        hints: [
          '"At most" means ≤, "at least" means ≥',
          'Plot each constraint as a boundary line',
          'The feasible region is where ALL constraints overlap'
        ],
        correctAnswer: 'm + e ≤ 10; m ≥ 2; e ≥ 2; feasible region is a triangle with corners (2,2), (8,2), (2,8)'
      }
    ]
  },
  'CSEC: Circle Theorems': {
    questions: [
      {
        problem: 'An arc of a circle subtends an angle of 80° at the centre. What angle does it subtend at a point on the major arc?',
        steps: [
          'Theorem: The angle at the centre is twice the angle at the circumference',
          'Angle at circumference = angle at centre ÷ 2 = 80° ÷ 2 = 40°'
        ],
        hints: [
          'Central angle = 2 × inscribed angle (when subtended by the same arc)',
          'The point must be on the opposite arc (major arc if angle is on minor side)',
          'Divide the central angle by 2'
        ],
        correctAnswer: '40°'
      },
      {
        problem: 'ABCD is a cyclic quadrilateral. Angle DAB = 110°. Find angle BCD.',
        steps: [
          'Theorem: Opposite angles in a cyclic quadrilateral are supplementary (add to 180°)',
          'Angle BCD = 180° − angle DAB = 180° − 110° = 70°'
        ],
        hints: [
          'Opposite angles in a cyclic quadrilateral sum to 180°',
          'A and C are opposite angles; B and D are opposite angles',
          'Supplementary means adding to 180°'
        ],
        correctAnswer: '70°'
      },
      {
        problem: 'O is the centre of a circle. Points A, B, C are on the circumference with AB as diameter. Angle BAC = 35°. Find angle ABC.',
        steps: [
          'Theorem: The angle in a semicircle (subtended by a diameter) is 90°',
          'So angle ACB = 90° (angle in a semicircle)',
          'In triangle ABC: angles sum to 180°',
          'Angle ABC = 180° − 90° − 35° = 55°'
        ],
        hints: [
          'An angle inscribed in a semicircle is always 90°',
          'Use the angle sum of a triangle (180°)',
          'AB is the diameter so angle ACB = 90°'
        ],
        correctAnswer: 'Angle ABC = 55°'
      }
    ]
  },
  'CSEC: Transformations': {
    questions: [
      {
        problem: 'Triangle ABC has vertices A(2, 3), B(4, 3), C(4, 6). Find the image after reflection in the y-axis.',
        steps: [
          'Reflection in y-axis: (x, y) → (−x, y)',
          'A(2, 3) → A′(−2, 3)',
          'B(4, 3) → B′(−4, 3)',
          'C(4, 6) → C′(−4, 6)',
          'Image triangle: A′(−2,3), B′(−4,3), C′(−4,6)'
        ],
        hints: [
          'Reflecting in the y-axis: change the sign of the x-coordinate only',
          'The y-coordinate stays the same',
          'Each point flips horizontally across the y-axis'
        ],
        correctAnswer: 'A′(−2,3), B′(−4,3), C′(−4,6)'
      },
      {
        problem: 'Point P(3, 1) is rotated 90° clockwise about the origin. Find its image P′.',
        steps: [
          'Rule for 90° clockwise rotation about origin: (x, y) → (y, −x)',
          'P(3, 1) → P′(1, −3)'
        ],
        hints: [
          '90° clockwise: (x, y) → (y, −x)',
          '90° anticlockwise: (x, y) → (−y, x)',
          '180°: (x, y) → (−x, −y)'
        ],
        correctAnswer: 'P′(1, −3)'
      },
      {
        problem: 'Shape A is translated by vector (−3, 2). Vertex Q(5, 1) maps to Q′. Find the coordinates of Q′. Then find the translation vector that maps Q′ back to Q.',
        steps: [
          'Translation adds the vector: Q′ = (5 + (−3), 1 + 2) = (2, 3)',
          'The inverse translation is the negative vector: (3, −2)',
          'Check: Q′(2,3) + (3, −2) = (5, 1) = Q ✓'
        ],
        hints: [
          'Translation: add the vector components to the coordinates',
          'The reverse translation uses the opposite vector',
          'Negate both components of the original translation vector'
        ],
        correctAnswer: 'Q′(2, 3); inverse translation vector is (3, −2)'
      }
    ]
  },
  'CSEC: Matrices 2': {
    questions: [
      {
        problem: 'Find the determinant and inverse of matrix M = [[4, 3], [2, 1]].',
        steps: [
          'det(M) = (4 × 1) − (3 × 2) = 4 − 6 = −2',
          'Since det ≠ 0, the inverse exists',
          'Adjoint: swap diagonal elements, change sign of off-diagonals → [[1, −3], [−2, 4]]',
          'M⁻¹ = (1/det) × adjoint = (1/−2) × [[1, −3], [−2, 4]]',
          'M⁻¹ = [[−1/2, 3/2], [1, −2]]'
        ],
        hints: [
          'det([[a,b],[c,d]]) = ad − bc',
          'To find inverse: swap the diagonal, negate the off-diagonal, divide by det',
          'Adjoint of [[a,b],[c,d]] is [[d,−b],[−c,a]]'
        ],
        correctAnswer: 'det = −2; M⁻¹ = [[−1/2, 3/2], [1, −2]]'
      },
      {
        problem: 'Use matrices to solve: x + 2y = 7 and 3x − y = 7.',
        steps: [
          'Write in matrix form: [[1, 2], [3, −1]] × [[x], [y]] = [[7], [7]]',
          'Find det of coefficient matrix: (1×−1) − (2×3) = −1 − 6 = −7',
          'Inverse = (1/−7) × [[−1, −2], [−3, 1]]',
          'Solution: [[x], [y]] = inverse × [[7], [7]]',
          'x = (1/−7)(−7 − 14) = (1/−7)(−21) = 3',
          'y = (1/−7)(−21 + 7) = (1/−7)(−14) = 2',
          'x = 3, y = 2'
        ],
        hints: [
          'Write as AX = B, so X = A⁻¹B',
          'Find the inverse of the coefficient matrix first',
          'Multiply the inverse by the constants vector'
        ],
        correctAnswer: 'x = 3, y = 2'
      },
      {
        problem: 'Find the 2×2 matrix that represents: (a) reflection in the x-axis, (b) rotation of 90° anticlockwise about the origin.',
        steps: [
          '(a) Reflection in x-axis: (x,y) → (x, −y)',
          'Matrix: [[1, 0], [0, −1]]',
          '(b) 90° anticlockwise: (x,y) → (−y, x)',
          'Matrix: [[0, −1], [1, 0]]'
        ],
        hints: [
          'A transformation matrix maps (1,0) and (0,1) to their images',
          'Column 1 = image of (1,0); Column 2 = image of (0,1)',
          'For reflection in x-axis: (1,0)→(1,0), (0,1)→(0,−1)'
        ],
        correctAnswer: '(a) [[1,0],[0,−1]]  (b) [[0,−1],[1,0]]'
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