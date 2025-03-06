import { useState, useRef, useCallback } from 'react';
import './CalendarPage.css';
import logo from '/pencil-me-in-logo.png';

export default function Calendar() {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [eventName, setEventName] = useState('');
  
  const dragStateRef = useRef({ isDragging: false, isDeselecting: false });
  const availabilityGridRef = useRef(null);

  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Time slots from 9am to 9pm (13 hours)
  const hours = Array.from({ length: 13 }, (_, i) => i + 9);
  
  // Format hour to am/pm
  const formatHour = (hour) => {
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour-12}pm`;
  };

  // Start dragging on mousedown
  const handleMouseDown = (hourIndex, minuteIndex, dayIndex) => (e) => {
    e.preventDefault(); // Prevent text selection
    
    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const isSelected = selectedSlots.includes(slotKey);
    
    // Update ref for use in event handlers
    dragStateRef.current = { 
      isDragging: true,
      isDeselecting: isSelected 
    };
    
    // Update state
    setIsDragging(true);
    setIsDeselecting(isSelected);
    
    // Toggle the initial cell
    setSelectedSlots(prev => {
      if (isSelected) {
        return prev.filter(slot => slot !== slotKey);
      } else {
        return [...prev, slotKey];
      }
    });
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle cell hover during drag
  const handleCellHover = (hourIndex, minuteIndex, dayIndex) => (e) => {
    if (!dragStateRef.current.isDragging) return;
    
    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const { isDeselecting } = dragStateRef.current;
    
    setSelectedSlots(prev => {
      // If deselecting and cell is selected, remove it
      if (isDeselecting) {
        if (prev.includes(slotKey)) {
          return prev.filter(slot => slot !== slotKey);
        }
      } 
      // If selecting and cell is not selected, add it
      else if (!prev.includes(slotKey)) {
        return [...prev, slotKey];
      }
      return prev;
    });
  };

  // Track mouse movement for dragging
  const handleMouseMove = useCallback((e) => {
    // No need to do anything specific here
    // All handled by the hover handlers on each cell
  }, []);

  // End dragging on mouseup
  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="my-calendar-container">
      <img src={logo} alt="pmi logo" className="my-calendar-logo" />
      <h3 className="my-calendar-title">Pencil Me In.</h3>
      
      <div className="my-calendar-inputs">
        <input 
          type="text" 
          placeholder="Event name" 
          className="my-calendar-event-input"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <div className="my-calendar-timezone">
          <span>{timeZone}</span>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="my-layout-container">
        {/* Your Availability */}
        <div className="my-calendar-side">
          <h2>Your Availability</h2>
          <div className="my-availability-grid" ref={availabilityGridRef}>
            <div className="my-availability-header">
              <div className="my-time-column"></div>
              {daysOfWeek.map((day, i) => (
                <div key={i} className="my-day-header">{day}</div>
              ))}
            </div>
            <div className="my-availability-body">
              {hours.map((hour, hourIndex) => (
                <div key={hourIndex} className="my-hour-container">
                  <div className="my-hour-label">{formatHour(hour)}</div>
                  <div className="my-minute-blocks">
                    {[0, 1, 2, 3].map((minuteIndex) => (
                      <div key={minuteIndex} className="my-minute-row">
                        {daysOfWeek.map((_, dayIndex) => {
                          const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
                          const isSelected = selectedSlots.includes(slotKey);
                          
                          return (
                            <div 
                              key={dayIndex}
                              data-hour={hourIndex}
                              data-minute={minuteIndex}
                              data-day={dayIndex}
                              className={`my-minute-cell ${isSelected ? 'selected' : ''}`}
                              onMouseDown={handleMouseDown(hourIndex, minuteIndex, dayIndex)}
                              onMouseEnter={handleCellHover(hourIndex, minuteIndex, dayIndex)}
                            ></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Group Availability */}
        <div className="my-calendar-side">
          <h2>Group Availability</h2>
          <div className="my-availability-grid">
            <div className="my-availability-header">
              <div className="my-time-column"></div>
              {daysOfWeek.map((day, i) => (
                <div key={i} className="my-day-header">{day}</div>
              ))}
            </div>
            <div className="my-availability-body">
              {hours.map((hour, hourIndex) => (
                <div key={hourIndex} className="my-hour-container">
                  <div className="my-hour-label">{formatHour(hour)}</div>
                  <div className="my-minute-blocks">
                    {[0, 1, 2, 3].map((minuteIndex) => (
                      <div key={minuteIndex} className="my-minute-row">
                        {daysOfWeek.map((_, dayIndex) => {
                          const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
                          const isSelected = selectedSlots.includes(slotKey);
                          
                          return (
                            <div 
                              key={dayIndex}
                              className={`my-minute-cell ${isSelected ? 'selected' : ''}`}
                            ></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="my-controls-container">
        <button className="my-calendar-submit-button">Pencil me in</button>
        
        <div className="my-toggle-container">
          <label className="my-toggle">
            <input type="checkbox" />
            <span className="my-toggle-slider"></span>
            <span className="my-toggle-label">Unavailable</span>
          </label>
          
          <label className="my-toggle">
            <input type="checkbox" />
            <span className="my-toggle-slider"></span>
            <span className="my-toggle-label">If needed</span>
          </label>
          
          <div className="my-legend-item">
            <span className="my-legend-color"></span>
            <span className="my-legend-label">Best times</span>
          </div>
        </div>
      </div>
    </div>
  );
}