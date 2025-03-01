import Popup from './components/Popup'
import {useState} from 'react'
import logo from '/pencil-me-in-logo.png'
import './Calendar.css'

const Calendar = (props) => {

    const [popup, setPopup] = useState(true);

    return (
        <div className='calendar-page-container'>
            <img src={logo} alt="Pencil Me In Logo" className="logo" />
            <div className='event-container'>
                <h3 className='event-text'>Pencil Me In.</h3>
                <input
                    type="text"
                    className="event-name-input"
                    placeholder={props.event}
                    value={props.event}
                    onChange={(e) => props.setEvent(e.target.value)}
                />
            </div>
            <Popup trigger = {popup} setTrigger = {setPopup}/>
        </div>
    )
};

export default Calendar