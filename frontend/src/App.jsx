import { useState } from 'react'
import './App.css'
import logo from '../public/pencil-me-in-logo.png'
import { Link } from 'react-router-dom'

function App() {
  /* const [count, setCount] = useState(0) */

  return (
    <>
    <img src={logo} alt="Pencil Me In Logo" className="logo" />
    <h3>Pencil Me In.</h3>
    </>
  )
}

export default App
