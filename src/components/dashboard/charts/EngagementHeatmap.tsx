import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Activity, Calendar } from 'lucide-react';

interface DayActivity {
  date: string;
  sessionCount: number;
  timeSpent: number; // in minutes
  problemsCompleted: number;
  accuracy: number;
}

interface EngagementHeatmapProps {
  data: DayActivity[];
  startDate: Date;
  endDate: Date;
}

const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ data, startDate, endDate }) => {
  // Generate all dates in the range
  const generateDateRange = (start: Date, end: Date) => {
    const dates = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const allDates = generateDateRange(startDate, endDate);
  
  // Create a map for quick lookup
  const activityMap = new Map(
    data.map(item => [item.date, item])
  );

  // Get activity intensity (0-4 scale)
  const getIntensity = (timeSpent: number) => {
    if (timeSpent === 0) return 0;
    if (timeSpent < 15) return 1;
    if (timeSpent < 30) return 2;
    if (timeSpent < 60) return 3;
    return 4;
  };

  // Get color based on intensity
  const getIntensityColor = (intensity: number) => {
    const colors = {
      0: 'bg-gray-100',
      1: 'bg-blue-200',
      2: 'bg-blue-400',
      3: 'bg-blue-600',
      4: 'bg-blue-800'
    };
    return colors[intensity as keyof typeof colors];
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get day of week
  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Group dates by week
  const groupByWeeks = (dates: Date[]) => {
    const weeks = [];
    let currentWeek = [];
    
    dates.forEach((date, index) => {
      currentWeek.push(date);
      
      // If it's Sunday or the last date, start a new week
      if (date.getDay() === 0 || index === dates.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeks = groupByWeeks(allDates);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate summary stats
  const totalDaysActive = data.filter(d => d.sessionCount > 0).length;
  const totalTimeSpent = data.reduce((sum, d) => sum + d.timeSpent, 0);
  const averageDailyTime = totalDaysActive > 0 ? totalTimeSpent / totalDaysActive : 0;
  const longestStreak = calculateLongestStreak(data);

  function calculateLongestStreak(activityData: DayActivity[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    // Sort by date to ensure chronological order
    const sortedData = [...activityData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedData.forEach(day => {
      if (day.sessionCount > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Learning Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="mb-6">
          {/* Day labels */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div></div> {/* Empty corner */}
            {dayLabels.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Heatmap rows */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-8 gap-1 mb-1">
              {/* Week label */}
              <div className="text-xs text-gray-500 text-right pr-2 flex items-center">
                {formatDate(week[0])}
              </div>
              
              {/* Fill in empty cells for first week */}
              {weekIndex === 0 && week[0].getDay() > 0 && 
                Array.from({ length: week[0].getDay() }, (_, i) => (
                  <div key={`empty-${i}`} className="w-4 h-4"></div>
                ))
              }
              
              {/* Activity cells */}
              {week.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const activity = activityMap.get(dateStr);
                const intensity = activity ? getIntensity(activity.timeSpent) : 0;
                
                return (
                  <div
                    key={dateStr}
                    className={`w-4 h-4 rounded-sm ${getIntensityColor(intensity)} border border-gray-200 cursor-pointer transition-all hover:scale-110`}
                    title={`${formatDate(date)}: ${activity ? `${activity.sessionCount} sessions, ${activity.timeSpent}min, ${activity.problemsCompleted} problems` : 'No activity'}`}
                  >
                  </div>
                );
              })}
              
              {/* Fill in empty cells for last week */}
              {weekIndex === weeks.length - 1 && week[week.length - 1].getDay() < 6 &&
                Array.from({ length: 6 - week[week.length - 1].getDay() }, (_, i) => (
                  <div key={`empty-end-${i}`} className="w-4 h-4"></div>
                ))
              }
            </div>
          ))}
        </div>

        {/* Intensity Legend */}
        <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
          <span>Less active</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)} border border-gray-200`}
              ></div>
            ))}
          </div>
          <span>More active</span>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalDaysActive}</div>
            <div className="text-sm text-gray-600">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(averageDailyTime)}</div>
            <div className="text-sm text-gray-600">Avg Daily Time (min)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{longestStreak}</div>
            <div className="text-sm text-gray-600">Longest Streak (days)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmap;