import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DatesDropdown from './components/DatesDropdown'
import TimezoneDropdown from './components/TimezoneDropdown'
import StartingTimeDropdown from './components/StartingTimeDropdown'
import EndingTimeDropdown from './components/EndingTimeDropdown'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Pencil Me In</h1>
      <DatesDropdown />
      <br /> <br/>
      <TimezoneDropdown />
      <br /> <br/>
      <StartingTimeDropdown />
      <br /> <br/>
      <EndingTimeDropdown />
    </>
  )
}

export default App
