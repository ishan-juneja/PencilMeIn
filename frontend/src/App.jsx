import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './HomePage.jsx';
import Calendar from './CalendarPage.jsx';
import FinalAvailability from './FinalAvailability.jsx';

function App() {
  return (
    <div id="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/final" element={<FinalAvailability />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
