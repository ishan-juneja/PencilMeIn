import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InputCalendar.css';

const InputCalendarPage = ({ selectedSlots, setSelectedSlots }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);

  // Toggle left panel between the calendar and meeting info
  const [showLeftCalendar, setShowLeftCalendar] = useState(true);

  const dragStateRef = useRef({
    isDragging: false,
    isDeselecting: false,
    lastHourIndex: null,
    lastMinuteIndex: null,
    lastDayIndex: null
  });

  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // 9 AM -> 9 PM => 13 total hours
  const hours = Array.from({ length: 13 }, (_, i) => i + 9);

  // Format hours, e.g. 9 => "9am", 13 => "1pm"
  const formatHour = (hour) => {
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  // -----------------------------------------
  // DRAG & DROP LOGIC
  // -----------------------------------------
  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    const cells = [];

    const startHour = Math.min(start.hourIndex, end.hourIndex);
    const endHour = Math.max(start.hourIndex, end.hourIndex);
    const startDay = Math.min(start.dayIndex, end.dayIndex);
    const endDay = Math.max(start.dayIndex, end.dayIndex);

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
      // Same hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = Math.min(startMinute, endMinute); m <= Math.max(startMinute, endMinute); m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
    } else {
      // Partial first hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = startMinute; m <= 3; m++) {
          cells.push(`${startHour}-${m}-${d}`);
        }
      }
      // Middle hours
      for (let h = startHour + 1; h < endHour; h++) {
        for (let d = startDay; d <= endDay; d++) {
          for (let m = 0; m <= 3; m++) {
            cells.push(`${h}-${m}-${d}`);
          }
        }
      }
      // Partial last hour
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

    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;

    if (cellsToProcess.length > 0) {
      setSelectedSlots((prev) => {
        let newSlots = [...prev];
        if (dragStateRef.current.isDeselecting) {
          // Remove
          newSlots = newSlots.filter(slot => !cellsToProcess.includes(slot));
        } else {
          // Add
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
    e.preventDefault();
    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const alreadySelected = selectedSlots.includes(slotKey);

    dragStateRef.current = {
      isDragging: true,
      isDeselecting: alreadySelected,
      lastHourIndex: hourIndex,
      lastMinuteIndex: minuteIndex,
      lastDayIndex: dayIndex
    };

    setIsDragging(true);
    setIsDeselecting(alreadySelected);

    // Toggle the clicked cell
    setSelectedSlots((prev) => {
      if (alreadySelected) {
        return prev.filter(slot => slot !== slotKey);
      } else {
        return [...prev, slotKey];
      }
    });

    // Global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCellHover = (hourIndex, minuteIndex, dayIndex) => () => {
    if (!dragStateRef.current.isDragging) return;
    processSelection(hourIndex, minuteIndex, dayIndex);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const cell = elements.find(elem => elem.classList?.contains('my-minute-cell'));
    if (cell) {
      const h = parseInt(cell.dataset.hour, 10);
      const m = parseInt(cell.dataset.minute, 10);
      const d = parseInt(cell.dataset.day, 10);
      if (!isNaN(h) && !isNaN(m) && !isNaN(d)) {
        processSelection(h, m, d);
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
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div className="my-layout-container">
      {/* LEFT SIDE (600×500) */}
      <div className="my-calendar-side left-square">
        {showLeftCalendar ? (
          <div className="calendar-container">
            <h2>Your Availability</h2>
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
                      {[0, 1, 2, 3].map((minuteIndex) => {
                        const rowKey = `r-${hourIndex}-${minuteIndex}`;
                        return (
                          <div key={rowKey} className="my-minute-row">
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
          /* The "Meeting Info" panel, also in a 600×500 container, with margin-top to lower it */
          <div className="meeting-info-panel">
            <h2 className="meeting-title">Creative Labs Meeting</h2>
            <p className="meeting-datetime">February 7th, 2025 7:45AM</p>
            
            <div className="availability-status">
              <div className="status-row">
                <span className="status-circle available"></span>
                <span>Ishan Juneja - Available</span>
              </div>
              <div className="status-row">
                <span className="status-circle unavailable"></span>
                <span>Tram Ng - Unavailable</span>
              </div>
              <div className="status-row">
                <span className="status-circle available"></span>
                <span>Phileena Nguyen - Available</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="action-btn">Schedule</button>
              <button className="action-btn">Add to Google Calendar</button>
              <button className="action-btn">Create Zoom Meeting</button>
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="legend-color best-times"></span>
                <span>Best times</span>
              </div>
              <div className="legend-item">
                <span className="legend-color if-needed"></span>
                <span>If needed</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE (600×500) -> Hover hides the left calendar */}
      <div
        className="my-calendar-side right-square"
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
