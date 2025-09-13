import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { TrendingUp } from 'lucide-react';

interface ProgressData {
  date: string;
  accuracy: number;
  problemsCompleted: number;
  timeSpent: number;
  cumulativeProgress: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, title = "Learning Progress Over Time" }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
    if (name === 'problemsCompleted') return [value, 'Problems Completed'];
    if (name === 'timeSpent') return [`${value} min`, 'Time Spent'];
    if (name === 'cumulativeProgress') return [`${value}%`, 'Cumulative Progress'];
    return [value, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(label) => `Date: ${formatDate(label)}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeProgress"
                stroke="#3b82f6"
                fill="url(#progressGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.length > 0 ? data[data.length - 1].cumulativeProgress : 0}%
            </div>
            <div className="text-sm text-gray-600">Current Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.reduce((sum, d) => sum + d.problemsCompleted, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(data.reduce((sum, d) => sum + d.timeSpent, 0) / 60)}h
            </div>
            <div className="text-sm text-gray-600">Total Study Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;