import { useState, useRef, useCallback, useEffect } from 'react';
import './CalendarPage.css';
import logo from '/pencil-me-in-logo.png';
import Popup from './components/Popup.jsx';
import './components/Popup.css';

export default function Calendar() {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [eventName, setEventName] = useState('');
  const [popup, setPopup] = useState(true);
  
  const dragStateRef = useRef({
    isDragging: false,
    isDeselecting: false,
    lastHourIndex: null,
    lastMinuteIndex: null,
    lastDayIndex: null
  });
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

  // Helper to get all cells between two points
  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    
    const cells = [];
    const startHour = Math.min(start.hourIndex, end.hourIndex);
    const endHour = Math.max(start.hourIndex, end.hourIndex);
    const startMinute = start.hourIndex < end.hourIndex ? start.minuteIndex : end.minuteIndex;
    const endMinute = start.hourIndex < end.hourIndex ? end.minuteIndex : start.minuteIndex;
    const startDay = Math.min(start.dayIndex, end.dayIndex);
    const endDay = Math.max(start.dayIndex, end.dayIndex);
    
    // If in the same hour
    if (startHour === endHour) {
      const minMinute = Math.min(start.minuteIndex, end.minuteIndex);
      const maxMinute = Math.max(start.minuteIndex, end.minuteIndex);
      
      for (let d = startDay; d <= endDay; d++) {
        for (let m = minMinute; m <= maxMinute; m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
    } 
    // If spanning multiple hours
    else {
      // First hour (partial)
      for (let d = startDay; d <= endDay; d++) {
        for (let m = startMinute; m <= 3; m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
      
      // Middle hours (complete)
      for (let h = startHour + 1; h < endHour; h++) {
        for (let d = startDay; d <= endDay; d++) {
          for (let m = 0; m <= 3; m++) {
            cells.push(`${h}-${m}-${d}`);
          }
        }
      }
      
      // Last hour (partial)
      for (let d = startDay; d <= endDay; d++) {
        for (let m = 0; m <= endMinute; m++) {
          cells.push(`${endHour}-${m}-${d}`);
        }
      }
    }
    
    return cells;
  };

  // Process selection when hovering over a cell
  const processSelection = (hourIndex, minuteIndex, dayIndex) => {
    const currentCell = { hourIndex, minuteIndex, dayIndex };
    const lastCell = {
      hourIndex: dragStateRef.current.lastHourIndex, 
      minuteIndex: dragStateRef.current.lastMinuteIndex, 
      dayIndex: dragStateRef.current.lastDayIndex
    };
    
    // Get all cells between last position and current position
    const cellsToProcess = getCellsBetween(lastCell, currentCell);
    
    // Update the last position
    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;
    
    // Process all the cells
    if (cellsToProcess.length > 0) {
      setSelectedSlots(prev => {
        let newSlots = [...prev];
        
        if (dragStateRef.current.isDeselecting) {
          // Remove all these cells if deselecting
          newSlots = newSlots.filter(slot => !cellsToProcess.includes(slot));
        } else {
          // Add all these cells if selecting (avoiding duplicates)
          cellsToProcess.forEach(cell => {
            if (!newSlots.includes(cell)) {
              newSlots.push(cell);
            }
          });
        }
        
        return newSlots;
      });
    }
  };

  // Start dragging on mousedown
  const handleMouseDown = (hourIndex, minuteIndex, dayIndex) => (e) => {
    e.preventDefault(); // Prevent text selection
    
    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const isSelected = selectedSlots.includes(slotKey);
    
    // Update ref for use in event handlers
    dragStateRef.current = { 
      isDragging: true,
      isDeselecting: isSelected,
      lastHourIndex: hourIndex,
      lastMinuteIndex: minuteIndex,
      lastDayIndex: dayIndex
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
    
    processSelection(hourIndex, minuteIndex, dayIndex);
  };

  // Global mouse move handler (backup for fast movements)
  const handleMouseMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;
    
    // Find the element under the mouse
    const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
    
    // Find the first element that is a minute cell
    const cellElement = elementsUnderMouse.find(elem => 
      elem.classList.contains('my-minute-cell')
    );
    
    if (cellElement) {
      const hourIndex = parseInt(cellElement.dataset.hour);
      const minuteIndex = parseInt(cellElement.dataset.minute);
      const dayIndex = parseInt(cellElement.dataset.day);
      
      if (!isNaN(hourIndex) && !isNaN(minuteIndex) && !isNaN(dayIndex)) {
        processSelection(hourIndex, minuteIndex, dayIndex);
      }
    }
  }, []);

  // End dragging on mouseup
  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="popup-trigger">
    <Popup trigger = {popup} setTrigger = {setPopup}/>
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