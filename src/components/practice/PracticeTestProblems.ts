export interface Problem {
  question: string;
  correctAnswer: string;
  topic: string;
  id: string;
}

export const problemBank: Record<string, Problem[]> = {
  'Fractions': [
    { id: 'f1', question: '1/2 + 1/4 = ?', correctAnswer: '3/4', topic: 'Fractions' },
    { id: 'f2', question: '2/3 - 1/6 = ?', correctAnswer: '1/2', topic: 'Fractions' },
    { id: 'f3', question: '1/3 × 2/5 = ?', correctAnswer: '2/15', topic: 'Fractions' },
    { id: 'f4', question: '3/4 ÷ 1/2 = ?', correctAnswer: '3/2', topic: 'Fractions' },
    { id: 'f5', question: '5/8 + 1/4 = ?', correctAnswer: '7/8', topic: 'Fractions' },
    { id: 'f6', question: '7/8 - 3/8 = ?', correctAnswer: '1/2', topic: 'Fractions' },
    { id: 'f7', question: '2/3 × 3/4 = ?', correctAnswer: '1/2', topic: 'Fractions' },
    { id: 'f8', question: '5/6 ÷ 1/3 = ?', correctAnswer: '5/2', topic: 'Fractions' },
    { id: 'f9', question: '1/5 + 2/5 = ?', correctAnswer: '3/5', topic: 'Fractions' },
    { id: 'f10', question: '4/5 - 1/5 = ?', correctAnswer: '3/5', topic: 'Fractions' },
    { id: 'f11', question: '3/8 + 1/8 = ?', correctAnswer: '1/2', topic: 'Fractions' },
    { id: 'f12', question: '5/6 - 1/6 = ?', correctAnswer: '2/3', topic: 'Fractions' },
    { id: 'f13', question: '1/4 × 2/3 = ?', correctAnswer: '1/6', topic: 'Fractions' },
    { id: 'f14', question: '2/5 ÷ 1/5 = ?', correctAnswer: '2', topic: 'Fractions' },
    { id: 'f15', question: '7/10 + 1/10 = ?', correctAnswer: '4/5', topic: 'Fractions' }
  ],
  'Decimals': [
    { id: 'd1', question: '2.5 + 1.75 = ?', correctAnswer: '4.25', topic: 'Decimals' },
    { id: 'd2', question: '3.6 - 1.8 = ?', correctAnswer: '1.8', topic: 'Decimals' },
    { id: 'd3', question: '2.4 × 1.5 = ?', correctAnswer: '3.6', topic: 'Decimals' },
    { id: 'd4', question: '7.2 ÷ 1.2 = ?', correctAnswer: '6', topic: 'Decimals' },
    { id: 'd5', question: '0.75 + 0.25 = ?', correctAnswer: '1', topic: 'Decimals' },
    { id: 'd6', question: '5.4 - 2.7 = ?', correctAnswer: '2.7', topic: 'Decimals' },
    { id: 'd7', question: '1.6 × 2.5 = ?', correctAnswer: '4', topic: 'Decimals' },
    { id: 'd8', question: '8.4 ÷ 2.1 = ?', correctAnswer: '4', topic: 'Decimals' },
    { id: 'd9', question: '3.25 + 1.75 = ?', correctAnswer: '5', topic: 'Decimals' },
    { id: 'd10', question: '6.8 - 3.4 = ?', correctAnswer: '3.4', topic: 'Decimals' },
    { id: 'd11', question: '4.2 + 2.8 = ?', correctAnswer: '7', topic: 'Decimals' },
    { id: 'd12', question: '9.5 - 4.5 = ?', correctAnswer: '5', topic: 'Decimals' },
    { id: 'd13', question: '3.2 × 1.25 = ?', correctAnswer: '4', topic: 'Decimals' },
    { id: 'd14', question: '10.5 ÷ 2.5 = ?', correctAnswer: '4.2', topic: 'Decimals' },
    { id: 'd15', question: '1.8 + 3.2 = ?', correctAnswer: '5', topic: 'Decimals' }
  ],
  'Percentages': [
    { id: 'p1', question: 'What is 20% of 50?', correctAnswer: '10', topic: 'Percentages' },
    { id: 'p2', question: 'What is 15% of 80?', correctAnswer: '12', topic: 'Percentages' },
    { id: 'p3', question: 'What is 25% of 60?', correctAnswer: '15', topic: 'Percentages' },
    { id: 'p4', question: 'What is 30% of 40?', correctAnswer: '12', topic: 'Percentages' },
    { id: 'p5', question: 'What is 10% of 90?', correctAnswer: '9', topic: 'Percentages' },
    { id: 'p6', question: 'What is 50% of 24?', correctAnswer: '12', topic: 'Percentages' },
    { id: 'p7', question: 'What is 75% of 20?', correctAnswer: '15', topic: 'Percentages' },
    { id: 'p8', question: 'What is 40% of 35?', correctAnswer: '14', topic: 'Percentages' },
    { id: 'p9', question: 'What is 60% of 25?', correctAnswer: '15', topic: 'Percentages' },
    { id: 'p10', question: 'What is 80% of 15?', correctAnswer: '12', topic: 'Percentages' },
    { id: 'p11', question: 'What is 35% of 20?', correctAnswer: '7', topic: 'Percentages' },
    { id: 'p12', question: 'What is 45% of 40?', correctAnswer: '18', topic: 'Percentages' },
    { id: 'p13', question: 'What is 65% of 20?', correctAnswer: '13', topic: 'Percentages' },
    { id: 'p14', question: 'What is 85% of 20?', correctAnswer: '17', topic: 'Percentages' },
    { id: 'p15', question: 'What is 90% of 30?', correctAnswer: '27', topic: 'Percentages' }
  ]
};