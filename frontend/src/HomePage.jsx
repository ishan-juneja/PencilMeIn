import './HomePage.css'
import DatesDropdown from './components/DatesDropdown.jsx'
import TimezoneDropdown from './components/TimezoneDropdown.jsx'
import StartingTimeDropdown from './components/StartingTimeDropdown.jsx'
import EndingTimeDropdown from './components/EndingTimeDropdown.jsx'
import CalendarSelection from './components/Calendar.jsx'
import logo from '/pencil-me-in-logo.png'
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Calendar from './CalendarPage.jsx'

const Home = () => {
    const navigate = useNavigate();
    const [eventName, setEventName] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeZone, setTimeZone] = useState('Pacific Time');
    const [startTime, setStartTime] = useState('9:00AM');
    const [endTime, setEndTime] = useState('10:00PM');

    const [dateOption, setDateOption] = useState('dates');

    const handleButtonClick = () => {
        <Calendar event={eventName} setEvent={setEventName}/>
        navigate("/calendar");
    };

    return(
        <div className="home-container">
            <img src={logo} alt="Pencil Me In Logo" className="logo" />
            <h3 className="pencil-me-in">Pencil Me In</h3>
                <p className="description">simplify scheduling, mazimize time</p>
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
                        <DatesDropdown className='dates-dropdown' setDateOption={setDateOption}/>
                    </div>
                    <CalendarSelection />

                </div>
                <div className="dropdowns-side">
                    <TimezoneDropdown />
                    <br /> <br />
                    <StartingTimeDropdown />
                    <br /> <br />
                    <EndingTimeDropdown />
                </div>
            </div>
            <button className="create-event-button" onClick={handleButtonClick}>Create Event</button>


        </div>
    )
};

export default Home;