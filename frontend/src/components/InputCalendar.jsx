import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InputCalendar.css';

/**
 *  selectedSlots: Array of { slotKey, color } that the user has manually selected
 *  setSelectedSlots: function to update selectedSlots
 *  ifNeeded: boolean => false => purple (#637EE8), true => yellow (#FFEA9D)
 *  startTime, endTime: e.g. "09:00", "17:00" for building the hours array
 *  busySlots: (optional) Array of slotKey strings that come from Google Calendar => shown in gray (#cfcfcf)
 */
function InputCalendarPage({
  selectedSlots,
  setSelectedSlots,
  ifNeeded,
  startTime,
  endTime,
  busySlots = []
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);
  const [showLeftCalendar, setShowLeftCalendar] = useState(true);

  // For drag logic
  const dragStateRef = useRef({
    isDragging: false,
    isDeselecting: false,
    lastHourIndex: null,
    lastMinuteIndex: null,
    lastDayIndex: null
  });

  // Helper to find a user-selected slot
  const findSlot = (slotKey) => {
    return selectedSlots.find(obj => obj.slotKey === slotKey);
  };

  // If the user’s startTime/endTime might be undefined, default them
  const safeStart = startTime || "09:00";
  const safeEnd = endTime || "21:00";
  const startHour = parseInt(safeStart.split(":")[0]);
  const endHour = parseInt(safeEnd.split(":")[0]);

  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Build hours array from startHour..endHour
  const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);

  // Convert 24-hour to e.g. "9am", "12pm"
  const formatHour = (hour24) => {
    if (hour24 === 12) return "12pm";
    let h12 = hour24 % 12;
    if (h12 === 0) h12 = 12;
    const suffix = hour24 < 12 ? 'am' : 'pm';
    return `${h12}${suffix}`;
  };

  // Check if a slotKey is in busySlots
  const isBusySlot = (slotKey) => busySlots.includes(slotKey);

  // Decide final color for a cell
  const getCellColor = (slotKey) => {
    const found = findSlot(slotKey);
    if (found) {
      // User manually selected => override color
      return found.color; 
    } else if (isBusySlot(slotKey)) {
      // Busy from Google => gray
      return '#cfcfcf';
    } else {
      // free
      return 'transparent';
    }
  };

  // Build a list of cells between two drag points
  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    const cells = [];

    const startHr = Math.min(start.hourIndex, end.hourIndex);
    const endHr = Math.max(start.hourIndex, end.hourIndex);
    const startDy = Math.min(start.dayIndex, end.dayIndex);
    const endDy = Math.max(start.dayIndex, end.dayIndex);

    const startMin = (start.hourIndex < end.hourIndex)
      ? start.minuteIndex
      : (start.hourIndex > end.hourIndex
          ? end.minuteIndex
          : Math.min(start.minuteIndex, end.minuteIndex));
    const endMin = (start.hourIndex < end.hourIndex)
      ? end.minuteIndex
      : (start.hourIndex > end.hourIndex
          ? start.minuteIndex
          : Math.max(start.minuteIndex, end.minuteIndex));

    if (startHr === endHr) {
      // same hour
      for (let d = startDy; d <= endDy; d++) {
        for (let m = startMin; m <= endMin; m++) {
          cells.push({ hourIndex: startHr, minuteIndex: m, dayIndex: d });
        }
      }
    } else {
      // partial first hour
      for (let d = startDy; d <= endDy; d++) {
        for (let m = startMin; m <= 3; m++) {
          cells.push({ hourIndex: startHr, minuteIndex: m, dayIndex: d });
        }
      }
      // middle hours
      for (let h = startHr + 1; h < endHr; h++) {
        for (let d = startDy; d <= endDy; d++) {
          for (let m = 0; m <= 3; m++) {
            cells.push({ hourIndex: h, minuteIndex: m, dayIndex: d });
          }
        }
      }
      // partial last hour
      for (let d = startDy; d <= endDy; d++) {
        for (let m = 0; m <= endMin; m++) {
          cells.push({ hourIndex: endHr, minuteIndex: m, dayIndex: d });
        }
      }
    }
    return cells;
  };

  // Add/remove multiple cells in one drag step
  const processSelection = (hourIndex, minuteIndex, dayIndex) => {
    const currentCell = { hourIndex, minuteIndex, dayIndex };
    const lastCell = {
      hourIndex: dragStateRef.current.lastHourIndex,
      minuteIndex: dragStateRef.current.lastMinuteIndex,
      dayIndex: dragStateRef.current.lastDayIndex
    };

    const cellsToProcess = getCellsBetween(lastCell, currentCell);

    // Update last known position
    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;

    if (cellsToProcess.length > 0) {
      setSelectedSlots((prev) => {
        let newSlots = [...prev];

        if (dragStateRef.current.isDeselecting) {
          // remove each cell
          for (const { hourIndex, minuteIndex, dayIndex } of cellsToProcess) {
            const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
            newSlots = newSlots.filter(obj => obj.slotKey !== slotKey);
          }
        } else {
          // add each cell with current color
          const color = ifNeeded ? '#FFEA9D' : '#637EE8';
          for (const { hourIndex, minuteIndex, dayIndex } of cellsToProcess) {
            const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
            if (!newSlots.find(obj => obj.slotKey === slotKey)) {
              newSlots.push({ slotKey, color });
            }
          }
        }
        return newSlots;
      });
    }
  };

  // On mousedown
  const handleMouseDown = (hourIndex, minuteIndex, dayIndex) => (e) => {
    e.preventDefault();
    const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
    const existing = findSlot(slotKey);
    const alreadySelected = !!existing;

    dragStateRef.current.isDragging = true;
    dragStateRef.current.isDeselecting = alreadySelected;
    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;

    setIsDragging(true);
    setIsDeselecting(alreadySelected);

    // immediately toggle that cell
    if (alreadySelected) {
      setSelectedSlots((prev) => prev.filter(obj => obj.slotKey !== slotKey));
    } else {
      const color = ifNeeded ? '#FFEA9D' : '#637EE8';
      setSelectedSlots((prev) => [...prev, { slotKey, color }]);
    }

    // Attach global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // On mouseenter (while dragging)
  const handleCellHover = (hourIndex, minuteIndex, dayIndex) => () => {
    if (!dragStateRef.current.isDragging) return;
    processSelection(hourIndex, minuteIndex, dayIndex);
  };

  // Global mousemove
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
  }, [ifNeeded]);

  // Global mouseup
  const handleMouseUp = useCallback(() => {
    dragStateRef.current.isDragging = false;
    setIsDragging(false);

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
                      {[0,1,2,3].map((minuteIndex) => {
                        const rowKey = `r-${hourIndex}-${minuteIndex}`;
                        return (
                          <div key={rowKey} className="my-minute-row">
                            {daysOfWeek.map((_, dayIndex) => {
                              const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
                              const cellColor = getCellColor(slotKey);
                              return (
                                <div
                                  key={dayIndex}
                                  data-hour={hourIndex}
                                  data-minute={minuteIndex}
                                  data-day={dayIndex}
                                  className="my-minute-cell"
                                  style={{ backgroundColor: cellColor }}
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
          /* Meeting info panel if hovered on the right */
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
              <button className="action-btn schedule-link">Schedule</button>
              <button className="action-btn">
                <img src="google-logo.png" alt="" className="btn-icon" />
                Add to Google Calendar
              </button>
              <button className="action-btn">
                <img src="zoom-logo.png" alt="" className="btn-icon" />
                Create Zoom Meeting
              </button>
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
                  {[0,1,2,3].map((minuteIndex) => (
                    <div key={minuteIndex} className="my-minute-row">
                      {daysOfWeek.map((_, dayIndex) => {
                        const slotKey = `${hourIndex}-${minuteIndex}-${dayIndex}`;
                        const cellColor = getCellColor(slotKey);
                        return (
                          <div
                            key={dayIndex}
                            className="my-minute-cell"
                            style={{ backgroundColor: cellColor }}
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
}

InputCalendarPage.propTypes = {
  selectedSlots: PropTypes.array.isRequired,
  setSelectedSlots: PropTypes.func.isRequired,
  ifNeeded: PropTypes.bool.isRequired,
  startTime: PropTypes.string,    // e.g. "09:00"
  endTime: PropTypes.string,      // e.g. "17:00"
  busySlots: PropTypes.array      // optional: e.g. ["9-2-3","10-1-0"] from Google
};

export default InputCalendarPage;
