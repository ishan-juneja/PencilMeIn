import Popup from './components/Popup'
import {useState} from 'react'

const Calendar = () => {

    const [popup, setPopup] = useState(true);

    return (
        <div>
        <h1>Calendar page</h1>
        <Popup trigger = {popup} setTrigger = {setPopup}/>
        </div>
    )
};

export default Calendar