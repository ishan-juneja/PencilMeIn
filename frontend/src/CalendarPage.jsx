import { useState } from 'react';
import { useLocation } from "react-router-dom";
import './CalendarPage.css';
import logo from '/pencil-me-in-logo.png';
import Popup from './components/Popup.jsx';
import InputCalendarPage from './components/InputCalendar.jsx';

export default function CalendarPage() {
  const location = useLocation();
  const event = location.state?.event;
  const startTime = location.state?.startTime;
  const endTime = location.state?.endTime;

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [eventName, setEventName] = useState('');
  const [popup, setPopup] = useState(true);

  const handleSubmit = () => {
    // Handle form submission
    console.log('Submitting event:', {
      eventName,
      timeZone,
      selectedSlots
    });
    
    // API Calls
  };

  return (
    <div className="popup-trigger">
      <Popup trigger={popup} setTrigger={setPopup}/>
      <div className="my-calendar-container">
        <img src={logo} alt="pmi logo" className="my-calendar-logo" />
        
        
        <div className="my-calendar-title-container">
          <h3 className="my-calendar-text">Pencil Me In.</h3>
          <h1 className="my-calendar-title">{event}</h1>
        </div>

        {/* Use the InputCalendarPage component */}
        <InputCalendarPage 
          selectedSlots={selectedSlots}
          setSelectedSlots={setSelectedSlots}
          endTime = {endTime}
          startTime = {startTime}
        />

        <div className="my-controls-container">
          <button 
            className="my-calendar-submit-button"
            onClick={handleSubmit}
          >
            Pencil Me In
          </button>
          
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
    </div>
  );
}