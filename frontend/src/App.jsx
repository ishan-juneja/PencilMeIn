import { useState } from 'react'
import './App.css'
import logo from '../public/pencil-me-in-logo.png'
import { Link } from 'react-router-dom'

function App() {
  /* const [count, setCount] = useState(0) */

  return (
    <>
    <img src={logo} alt="Pencil Me In Logo" className="logo" />
    <div className="form-container">
      <h3 className="pencil-me-in">Pencil Me In.</h3>
      <input 
        type="text"
        className = "event-name-input"
        placeholder="Enter Event Name" 
      />
      </div>
    </>
  )
}

export default App