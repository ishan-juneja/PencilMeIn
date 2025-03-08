import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InputCalendar.css';

const InputCalendarPage = ({ selectedSlots, setSelectedSlots }) => {
  // State controlling drag
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);

  // **New**: controls whether to show the left calendar or the "who's available" panel
  const [showLeftCalendar, setShowLeftCalendar] = useState(true);

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
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  // ---------------------------------------
  // Drag-and-drop logic for left calendar
  // ---------------------------------------

  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    
    const cells = [];
    const startHour = Math.min(start.hourIndex, end.hourIndex);
    const endHour = Math.max(start.hourIndex, end.hourIndex);
    const startDay = Math.min(start.dayIndex, end.dayIndex);
    const endDay = Math.max(start.dayIndex, end.dayIndex);

    // Determine which cell is “first” vs “second” for the minute indices
    // if in the same hour or if spanning multiple hours
    const startMinute = (start.hourIndex < end.hourIndex)
      ? start.minuteIndex
      : (start.hourIndex > end.hourIndex
          ? end.minuteIndex
          : Math.min(start.minuteIndex, end.minuteIndex));
    const endMinute = (start.hourIndex < end.hourIndex)
      ? end.minuteIndex
      : (start.hourIndex > end.hourIndex
          ? start.minuteIndex
          : Math.max(start.minuteIndex, end.minuteIndex));

    if (startHour === endHour) {
      // Same hour => just loop minute indices
      for (let d = startDay; d <= endDay; d++) {
        for (let m = Math.min(startMinute, endMinute); m <= Math.max(startMinute, endMinute); m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
    } else {
      // Spanning multiple hours
      // 1) partial first hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = startMinute; m <= 3; m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
      // 2) full middle hours
      for (let h = startHour + 1; h < endHour; h++) {
        for (let d = startDay; d <= endDay; d++) {
          for (let m = 0; m <= 3; m++) {
            cells.push(`${h}-${m}-${d}`);
          }
        }
      }
      // 3) partial last hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = 0; m <= endMinute; m++) {
          cells.push(`${endHour}-${m}-${d}`);
        }
      }
    }
    return cells;
  };

  const processSelection = (hourIndex, minuteIndex, dayIndex) => {
    const currentCell = { hourIndex, minuteIndex, dayIndex };
    const lastCell = {
      hourIndex: dragStateRef.current.lastHourIndex, 
      minuteIndex: dragStateRef.current.lastMinuteIndex, 
      dayIndex: dragStateRef.current.lastDayIndex
    };
    
    const cellsToProcess = getCellsBetween(lastCell, currentCell);
    
    // Update the last position
    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;
    
    // Process the cells
    if (cellsToProcess.length > 0) {
      setSelectedSlots(prev => {
        let newSlots = [...prev];
        
        if (dragStateRef.current.isDeselecting) {
          // Remove cells if deselecting
          newSlots = newSlots.filter(slot => !cellsToProcess.includes(slot));
        } else {
          // Add cells if selecting
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

  const handleMouseDown = (hourIndex, minuteIndex, dayIndex) => (e) => {
    e.preventDefault(); // Prevent text selection

    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const isSelected = selectedSlots.includes(slotKey);

    dragStateRef.current = { 
      isDragging: true,
      isDeselecting: isSelected,
      lastHourIndex: hourIndex,
      lastMinuteIndex: minuteIndex,
      lastDayIndex: dayIndex
    };

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

    // Attach global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCellHover = (hourIndex, minuteIndex, dayIndex) => () => {
    if (!dragStateRef.current.isDragging) return;
    processSelection(hourIndex, minuteIndex, dayIndex);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    // Find the element under the mouse
    const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
    const cellElement = elementsUnderMouse.find(elem =>
      elem.classList?.contains('my-minute-cell')
    );
    
    if (cellElement) {
      const hourIndex = parseInt(cellElement.dataset.hour, 10);
      const minuteIndex = parseInt(cellElement.dataset.minute, 10);
      const dayIndex = parseInt(cellElement.dataset.day, 10);
      
      if (!isNaN(hourIndex) && !isNaN(minuteIndex) && !isNaN(dayIndex)) {
        processSelection(hourIndex, minuteIndex, dayIndex);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    // Cleanup if component unmounts
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div className="my-layout-container">
      
      {/* Conditionally render the LEFT side:
          EITHER the "Your Availability" calendar OR the "Who is/isn't available" UI */}
      {showLeftCalendar ? (
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
                    {[0, 1, 2, 3].map((minuteIndex) => {
                      return (
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
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* If NOT showing the left calendar, show "who is/isn't available" panel */
        <div className="my-calendar-side">
          <h2>Who’s Available</h2>
          <ul style={{ textAlign: 'left', marginLeft: '2rem' }}>
            <li>Ishan: Available</li>
            <li>Tram: Unavailable</li>
            <li>Phileena: Available</li>
            {/* etc. or dynamic data */}
          </ul>
        </div>
      )}

      {/* RIGHT side: Group Availability 
          onMouseEnter => hide left calendar 
          onMouseLeave => show left calendar again */}
      <div
        className="my-calendar-side"
        onMouseEnter={() => setShowLeftCalendar(false)}
        onMouseLeave={() => setShowLeftCalendar(true)}
      >
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
                          />
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
  );
};

InputCalendarPage.propTypes = {
  selectedSlots: PropTypes.array.isRequired,
  setSelectedSlots: PropTypes.func.isRequired
};

export default InputCalendarPage;
