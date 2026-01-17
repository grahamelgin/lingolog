import { useState, useEffect } from 'react';
import './Heatmap.css';

function Heatmap({ isDarkMode, api, refreshTrigger }) {
  const [dailyActivity, setDailyActivity] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    fetchDailyActivity();
  }, [refreshTrigger]);

  const fetchDailyActivity = async () => {
    try {
      const response = await api.get('/sessions/daily-activity');
      setDailyActivity(response.data);
      calculateStreak(response.data);
    } catch (error) {
      console.error('Error fetching daily activity:', error);
    }
  };

  const calculateStreak = (data) => {
    if (data.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Filter out future dates and create activity map
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activityMap = {};
    data.forEach(day => {
      const dayDate = new Date(day.date + 'T00:00:00');
      // Only include dates that are today or in the past
      if (dayDate <= today) {
        activityMap[day.date] = true;
      }
    });

    let streak = 0;
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let checkDate = new Date(today);
    if (!activityMap[todayStr]) {
      checkDate = yesterday;
      if (!activityMap[yesterdayStr]) {
        setCurrentStreak(0);
        return;
      }
    }

    while (activityMap[checkDate.toISOString().split('T')[0]]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    setCurrentStreak(streak);
  };

  const getYearGrid = () => {
    const year = new Date().getFullYear();
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31); // Dec 31
    
    // Find the Sunday before or on Jan 1
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(startDay);
    
    // Continue until we've covered the entire year
    while (currentDate.getFullYear() <= year) {
      if (currentDate.getFullYear() === year && currentDate <= lastDay) {
        currentWeek.push(new Date(currentDate));
      } else if (currentDate < firstDay) {
        currentWeek.push(null); // Empty cell before year starts
      } else if (currentDate > lastDay) {
        break;
      }
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill remaining days in the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const getActivityForDate = (date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return dailyActivity.find(d => d.date === dateStr);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const weeks = getYearGrid();

  return (
    <div className={`heatmap-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="heatmap-header">
        <h3>{new Date().getFullYear()} Activity</h3>
        <div className="streak-counter">
          <span className="streak-number">{currentStreak}</span>
          <span className="streak-label">day streak</span>
        </div>
      </div>

      <div className="heatmap-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-week">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="heatmap-day empty" />;
              }
              
              const activity = getActivityForDate(date);
              const hasActivity = activity && activity.total_minutes > 0;

              return (
                <div
                  key={dayIndex}
                  className={`heatmap-day ${hasActivity ? 'active' : ''}`}
                  onMouseEnter={(e) => setHoveredDay({ date, activity, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredDay(null)}
                  onMouseMove={(e) => setHoveredDay({ date, activity, x: e.clientX, y: e.clientY })}
                />
              );
            })}
          </div>
        ))}
      </div>

      {hoveredDay && hoveredDay.date && (
        <div 
          className="heatmap-tooltip"
          style={{
            left: `${hoveredDay.x + 10}px`,
            top: `${hoveredDay.y + 10}px`,
            transform: 'none',
            bottom: 'auto'
          }}
        >
          <strong>{hoveredDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          <br />
          {hoveredDay.activity ? formatTime(hoveredDay.activity.total_minutes) : 'No activity'}
        </div>
      )}
    </div>
  );
}

export default Heatmap;
