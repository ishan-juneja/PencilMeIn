import { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import './InputCalendar.css';

function InputCalendarPage({ selectedSlots, setSelectedSlots, ifNeeded, startTime, endTime, dateArray}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);

  const totalUsers = 3; // Hard coded, should be from GET request


  const availability_dict = {
    "2025-03-11": {
      'availability': [
        {'start': "09:00 AM", end: "09:30 AM", available: 1},
        {'start': "10:00 AM", end: "10:30 AM", available: 1}
      ]
    },
    "2025-03-12": {
      'availability': [
        {'start': "11:00 AM", end: "11:15 AM", available: 1},
        {'start': "11:30 AM", end: "11:45 AM", available: 1}
      ]
    }
  }

  const right_dict = {
    "2025-03-13": {
      'availability': [
        {'start': "09:00 AM", end: "09:30 AM", available: 1},
        {'start': "10:00 AM", end: "10:30 AM", available: 1}
      ]
    },
    "2025-03-14": {
      'availability': [
        {'start': "11:00 AM", end: "11:15 AM", available: 1},
        {'start': "11:30 AM", end: "11:45 AM", available: 1}
      ]
    }
  }

  useEffect(() => {
  // --- 1) Build LEFT slots from availability_dict ---
  const newLeftSlots = [];

  for (const [dateKey, dateObject] of Object.entries(availability_dict)) {
    const d = new Date(dateKey + "T12:00:00");
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month   = d.toLocaleDateString("en-US", { month: "2-digit" });
    const day     = d.toLocaleDateString("en-US", { day: "2-digit" });
    const dateLabel = `${weekday} ${month}/${day}`;

    const blocks = dateObject.availability; 
    for (const block of blocks) {
      const [timePart, ampm] = block.start.split(" ");
      let [hourStr, minStr]  = timePart.split(":");
      let hour = parseInt(hourStr, 10);

      // Convert to 24hr
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0; // midnight edge case

      const hrPadded = String(hour).padStart(2, "0");
      const slotKey  = `${hrPadded}:${minStr} ${dateLabel}`;

      // Use grey color (or any color you want)
      newLeftSlots.push({
        slotKey,
        color: "rgba(128,128,128,1)"
      });
    }
  }

  // Put the LEFT slots into selectedSlots (left calendar)
  setSelectedSlots(prev => [...prev, ...newLeftSlots]);

  // --- 2) Build RIGHT slots from right_dict ---
  const newRightSlots = [];

  for (const [dateKey, dateObject] of Object.entries(right_dict)) {
    const d = new Date(dateKey + "T12:00:00");
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month   = d.toLocaleDateString("en-US", { month: "2-digit" });
    const day     = d.toLocaleDateString("en-US", { day: "2-digit" });
    const dateLabel = `${weekday} ${month}/${day}`;

    const blocks = dateObject.availability; 
    for (const block of blocks) {
      const [timePart, ampm] = block.start.split(" ");
      let [hourStr, minStr]  = timePart.split(":");
      let hour = parseInt(hourStr, 10);

      // Convert to 24hr
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      const hrPadded = String(hour).padStart(2, "0");
      const slotKey  = `${hrPadded}:${minStr} ${dateLabel}`;

      const numAvailable = 2;       // replace with get function
      const opacity = (1/totalUsers) * numAvailable;
      const color = ifNeeded ? `rgba(255, 234, 157, ${opacity})` : `rgba(99, 126, 232, ${opacity})`;

      newRightSlots.push({
        slotKey,
        color: color  // Hard coded color
      });
    }
  }

  // Put the RIGHT slots into groupAvailability (right calendar)
  setGroupAvailability(prev => [...prev, ...newRightSlots]);

  // Run only once on mount
}, []);

  
  

  // ======================================================

  const [groupAvailability, setGroupAvailability] = useState([]);

  const findGroupSlot = (slotKey) => {
    return groupAvailability.find(obj => obj.slotKey === slotKey);
  };


  // total # of users that put in their availability
  

  // Whether to show the left "Your Availability" or "Meeting Info"
  const [showLeftCalendar, setShowLeftCalendar] = useState(true);

  // Store objects in selectedSlots: { slotKey, color }

  const findSlot = (slotKey) => {
    return selectedSlots.find(obj => obj.slotKey === slotKey);
  };

  // "drag state" reference
  const dragStateRef = useRef({
    isDragging: false,
    isDeselecting: false,
    lastHourIndex: null,
    lastMinuteIndex: null,
    lastDayIndex: null
  });

  const formattedDates = dateArray.map(date => {
    const d = new Date(date);
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "2-digit" });
    const day = d.toLocaleDateString("en-US", { day: "2-digit" });
  
    return `${weekday} ${month}/${day}`;
  });

  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);

  // Time slots from 9am to 9pm (13 hours)
  const hours = Array.from({ length: endHour-startHour }, (_, i) => i + startHour);
  
  // Format hour to am/pm
  const formatHour = (hour) => {
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  // Helper to get all cells between two points
  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    const cells = [];

    const startHour = Math.min(start.hourIndex, end.hourIndex);
    const endHour = Math.max(start.hourIndex, end.hourIndex);
    const startDay = Math.min(start.dayIndex, end.dayIndex);
    const endDay = Math.max(start.dayIndex, end.dayIndex);

    // minuteIndex range
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
        for (let m = startMinute; m <= endMinute; m++) {
          cells.push({ hourIndex: startHour, minuteIndex: m, dayIndex: d });
        }
      }
    } else {
      // Partial first hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = startMinute; m <= 3; m++) {
          cells.push({ hourIndex: startHour, minuteIndex: m, dayIndex: d });
        }
      }
      // Middle hours
      for (let h = startHour + 1; h < endHour; h++) {
        for (let d = startDay; d <= endDay; d++) {
          for (let m = 0; m <= 3; m++) {
            cells.push({ hourIndex: h, minuteIndex: m, dayIndex: d });
          }
        }
      }
      // Partial last hour
      for (let d = startDay; d <= endDay; d++) {
        for (let m = 0; m <= endMinute; m++) {
          cells.push({ hourIndex: endHour, minuteIndex: m, dayIndex: d });
        }
      }
    }
    return cells;
  };

  // Add or remove multiple cells in one drag step
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
      setSelectedSlots(prev => {
        let newSlots = [...prev];

        if (dragStateRef.current.isDeselecting) {
          // Remove each cell from newSlots
          cellsToProcess.forEach(({ hourIndex, minuteIndex, dayIndex }) => {
            const hour = (startHour + hourIndex).toString().padStart(2, "0");
            const minutes = (minuteIndex * 15).toString().padStart(2, "0");
            const date = formattedDates[dayIndex];

            const slotKey = `${hour}:${minutes} ${date}`;
            newSlots = newSlots.filter(obj => obj.slotKey !== slotKey);
          });
        } else {
          // Add each cell with the current color, if not already in
          const numAvailable = 2;       // replace with get function
          const opacity = (1/totalUsers) * numAvailable;
          const color = ifNeeded ? `rgba(255, 234, 157, ${opacity})` : `rgba(99, 126, 232, ${opacity})`;
          cellsToProcess.forEach(({ hourIndex, minuteIndex, dayIndex }) => {
            const hour = (startHour + hourIndex).toString().padStart(2, "0");
            const minutes = (minuteIndex * 15).toString().padStart(2, "0");
            const date = formattedDates[dayIndex];

            const slotKey = `${hour}:${minutes} ${date}`;
            if (!newSlots.find(obj => obj.slotKey === slotKey)) {
              newSlots.push({ slotKey, color });
            }
          });
        }
        return newSlots;
      });
    }
  };

  // Mouse down on a cell
  const handleMouseDown = (hourIndex, minuteIndex, dayIndex) => (e) => {
    e.preventDefault();
    
    const hour = (startHour + hourIndex).toString().padStart(2, "0");
    const minutes = (minuteIndex * 15).toString().padStart(2, "0");
    const date = formattedDates[dayIndex];
    const slotKey = `${hour}:${minutes} ${date}`;

    const existing = findSlot(slotKey);
    const alreadySelected = !!existing;

    dragStateRef.current.isDragging = true;
    dragStateRef.current.isDeselecting = alreadySelected;
    dragStateRef.current.lastHourIndex = hourIndex;
    dragStateRef.current.lastMinuteIndex = minuteIndex;
    dragStateRef.current.lastDayIndex = dayIndex;

    setIsDragging(true);
    setIsDeselecting(alreadySelected);

    if (alreadySelected) {
      // Remove it
      setSelectedSlots(prev => prev.filter(obj => obj.slotKey !== slotKey));
    } else {
      // Add it with current color
      const numAvailable = 2;       // replace with get function
      const opacity = (1/totalUsers) * numAvailable;
      const color = ifNeeded ? `rgba(255, 234, 157, ${opacity})` : `rgba(99, 126, 232, ${opacity})`;
      setSelectedSlots(prev => [...prev, { slotKey, color }]);
    }

    // Attach global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // If user is dragging, process each new cell they hover over
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
  // note: include ifNeeded so color is correct mid-drag if toggled

  // Global mouseup
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

  // Helper to get the color for a cell
  // const getCellColor = (slotKey) => {
  //   const found = findSlot(slotKey);
  //   return found ? found.color : 'transparent';
  // };

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
                {formattedDates.map((date, i) => {
                  const [weekday, day] = date.split(" ");
                  return (
                    <div key={i} className="my-day-header">{weekday} <br /> {day}</div>
                  );
                })}
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
                            {formattedDates.map((_, dayIndex) => {
                              const hour = (startHour + hourIndex).toString().padStart(2, "0");
                              const minutes = (minuteIndex * 15).toString().padStart(2, "0");
                              const date = formattedDates[dayIndex];
                  
                              const slotKey = `${hour}:${minutes} ${date}`;

                              const found = findSlot(slotKey);
                              let color = found ? found.color : 'transparent';

                              if (color.startsWith("rgba")) {
                                color = color.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/, "rgb($1, $2, $3)");
                              }
                              
                              return (
                                <div
                                  key={dayIndex}
                                  data-hour={hourIndex}
                                  data-minute={minuteIndex}
                                  data-day={dayIndex}
                                  className="my-minute-cell"
                                  style={{ backgroundColor: color }}
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
                <span>Philena Nguyen - Available</span>
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
            {formattedDates.map((date, i) => {
              const [weekday, day] = date.split(" ");
              return (
                <div key={i} className="my-day-header">{weekday} <br /> {day}</div>
              );
            })}
          </div>
          <div className="my-availability-body">
            {hours.map((hour, hourIndex) => (
              <div key={hourIndex} className="my-hour-container">
                <div className="my-hour-label">{formatHour(hour)}</div>
                <div className="my-minute-blocks">
                  {[0, 1, 2, 3].map((minuteIndex) => (
                    <div key={minuteIndex} className="my-minute-row">
                      {formattedDates.map((_, dayIndex) => {

                        const hour = (startHour + hourIndex).toString().padStart(2, "0");
                        const minutes = (minuteIndex * 15).toString().padStart(2, "0");
                        const date = formattedDates[dayIndex];

                        const slotKey = `${hour}:${minutes} ${date}`;
                        // If it's in selectedSlots, highlight it
                        const found = findGroupSlot(slotKey);
                        const color = found ? found.color : 'transparent';

                        return (
                          <div
                            key={dayIndex}
                            className="my-minute-cell"
                            style={{ backgroundColor: color }}
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
};

export default InputCalendarPage;
