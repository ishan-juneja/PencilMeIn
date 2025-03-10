import './HomePage.css'
import DatesDropdown from './components/DatesDropdown.jsx'
import TimezoneDropdown from './components/TimezoneDropdown.jsx'
import StartingTimeDropdown from './components/StartingTimeDropdown.jsx'
import EndingTimeDropdown from './components/EndingTimeDropdown.jsx'
import CalendarSelection from './components/HomePageCalendar.jsx'
import logo from '/pencil-me-in-logo.png'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Calendar from './CalendarPage.jsx'

const Home = () => {
    const navigate = useNavigate();
    const [eventName, setEventName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState('9:00');
    const [endTime, setEndTime] = useState('17:00');

    const [dateOption, setDateOption] = useState('Specific Dates');
    const [timeZone, setTimeZone] = useState('Pacific Time');

    const [datesSelected, setDatesSelected] = useState([]);

    const handleButtonClick = () => {
        datesSelected.sort((a, b) => new Date(a) - new Date(b));
        navigate("/calendar", { state: { 
            event: eventName,
            startTime: startTime,
            endTime: endTime,
            datesSelected: datesSelected
        } });
    };

    return(
        <div className="home-container">
            <img src={logo} alt="Pencil Me In Logo" className="logo" />
            <h3 className="pencil-me-in">Pencil Me In</h3>
                <p className="description">simplify scheduling, maximize time</p>
            <div className="form-container">
                <input
                    type="text"
                    className="event-name-input"
                    placeholder="Pencil in an event name..."
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                />
            </div>
            <div className="layout-container">
                <div className="calendar-side">
                    <div className="calendar-text">
                        <p className='calendar-description'>Pencil In Dates...</p>
                        <DatesDropdown className='dates-dropdown' setDateOption={setDateOption} dateOption={dateOption}/>
                    </div>
                    <CalendarSelection setDatesSelected = {setDatesSelected}/>
                    

                </div>
                <div className="dropdowns-side">
                    <div className='dropdowns-text'>
                        <p className='dropdowns-description'>Pencil In a Time Frame...</p>
                        <TimezoneDropdown className='timezone-dropdown' setTimeZone={setTimeZone} timeZone={timeZone}/>
                    </div>
                    <StartingTimeDropdown className='starting-time-dropdown' setStartTime={setStartTime} startTime={startTime}/>
                    <EndingTimeDropdown className='ending-time-dropdown' setEndTime={setEndTime} endTime={endTime}/>
                    
                    <button className="create-event-button" onClick={handleButtonClick}>Create Event</button>
                </div>
            </div>
        </div>
    )
};

export default Home;