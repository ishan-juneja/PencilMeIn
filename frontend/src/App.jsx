import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import DatesDropdown from './components/DatesDropdown'
import TimezoneDropdown from './components/TimezoneDropdown'
import StartingTimeDropdown from './components/StartingTimeDropdown'
import EndingTimeDropdown from './components/EndingTimeDropdown'
import { Link } from 'react-router-dom'
import logo from '../public/pencil-me-in-logo.png'

function App() {
  const [count, setCount] = useState(0)

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
      <h1>Pencil Me In</h1>
      <DatesDropdown />
      <br /> <br />
      <TimezoneDropdown />
      <br /> <br />
      <StartingTimeDropdown />
      <br /> <br />
      <EndingTimeDropdown />
    </>
  )
}

export default App
