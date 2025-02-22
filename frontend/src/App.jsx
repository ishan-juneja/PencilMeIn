import React, { useState } from 'react';
import './App.css';
import DatesDropdown from './components/DatesDropdown';
import TimezoneDropdown from './components/TimezoneDropdown';
import StartingTimeDropdown from './components/StartingTimeDropdown';
import EndingTimeDropdown from './components/EndingTimeDropdown';
import { Link } from 'react-router-dom';
import logo from '../public/pencil-me-in-logo.png';
import CalendarSelection from './components/Calendar.jsx';

function App() {
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [startTime, setStartTime] = useState('9:00AM');
  const [endTime, setEndTime] = useState('10:00PM');

  return (
    <>
      <img src={logo} alt="Pencil Me In Logo" className="logo" />
      <div className="form-container">
        <h3 className="pencil-me-in">Pencil Me In.</h3>
        <input
          type="text"
          className="event-name-input" 
          placeholder="Enter Event Name"
        />
      </div>
      
      <div className="layout-container">
        <div className="calendar-side">
          <CalendarSelection />
        </div>
        <div className="dropdowns-side">
          <DatesDropdown />
          <br /> <br />
          <TimezoneDropdown />
          <br /> <br />
          <StartingTimeDropdown />
          <br /> <br />
          <EndingTimeDropdown />
        </div>
      </div>
    </>
  );
}

export default App;