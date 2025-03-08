import { useState } from 'react';
import './CalendarPage.css';
import logo from '/pencil-me-in-logo.png';
import Popup from './components/Popup.jsx';
import InputCalendarPage from './components/InputCalendar.jsx';

export default function CalendarPage() {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [eventName, setEventName] = useState('');
  const [popup, setPopup] = useState(true);

  // Single toggle: ifNeeded = false => "Available" (purple), ifNeeded = true => "If needed" (yellow)
  const [ifNeeded, setIfNeeded] = useState(false);

  const handleSubmit = () => {
    console.log('Submitting event:', {
      eventName,
      timeZone,
      selectedSlots
    });
    // TODO: API or Firebase calls
  };

  return (
    <div className="popup-trigger">
      <Popup trigger={popup} setTrigger={setPopup}/>
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
              <path 
                d="M7 10l5 5 5-5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Pass ifNeeded + selectedSlots down to InputCalendarPage */}
        <InputCalendarPage 
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          ifNeeded={ifNeeded}
        />

        <div className="my-controls-container">
          <button 
            className="my-calendar-submit-button"
            onClick={handleSubmit}
          >
            Pencil Me In
          </button>
          
          {/* Single toggle for "Available" vs. "If needed" */}
          <div className="my-toggle-container">
            <label className="my-toggle">
              <span className="my-toggle-label">Available</span>
              
              <input
                type="checkbox"
                checked={ifNeeded}
                onChange={(e) => setIfNeeded(e.target.checked)}
              />
              <span className="my-toggle-slider"></span>
              
              <span className="my-toggle-label">If needed</span>
            </label>
            
            {/* Example legend item */}
            <div className="my-legend-item">
              <span className="my-legend-color"></span>
              <span className="my-legend-label">Best times</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
