import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

function App() {
  const [eventName, setEventName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeZone, setTimeZone] = useState('Pacific Time');
  const [startTime, setStartTime] = useState('9:00AM');
  const [endTime, setEndTime] = useState('10:00PM');

  return (
    <div className="min-h-screen p-4">
      {/* Logo and Header */}
      <div className="fixed top-8 left-8">
        <div className="text-blue-600 font-bold text-2xl">pmi</div>
        <div className="text-blue-600 mt-2">Pencil Me In.</div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto mt-24">
        {/* Event Name Input */}
        <input
          type="text"
          placeholder="Enter Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full p-3 mb-8 border rounded-lg text-lg"
        />

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Date Selection */}
          <div>
            <div className="mb-4">
              <label className="block text-lg mb-2">What dates work?</label>
              <select className="w-full p-2 border rounded">
                <option>Specific Dates</option>
                <option>Days of the Week</option>
              </select>
            </div>

            <div className="border rounded-lg p-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>
          </div>

          {/* Right Column - Time Selection */}
          <div>
            <div className="mb-4">
              <label className="block text-lg mb-2">What time frame?</label>
              <select 
                className="w-full p-2 border rounded"
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
              >
                <option>Pacific Time</option>
                <option>Eastern Time</option>
                <option>Central Time</option>
                <option>Mountain Time</option>
              </select>
            </div>

            <div className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {Array.from({ length: 16 }, (_, i) => {
                  const hour = (i + 6) % 12 || 12;
                  const period = i + 6 < 12 ? 'AM' : 'PM';
                  return (
                    <option key={i} value={`${hour}:00${period}`}>
                      {`${hour}:00${period}`}
                    </option>
                  );
                })}
              </select>

              <div className="text-center">to</div>

              <select
                className="w-full p-2 border rounded"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                {Array.from({ length: 16 }, (_, i) => {
                  const hour = (i + 6) % 12 || 12;
                  const period = i + 6 < 12 ? 'AM' : 'PM';
                  return (
                    <option key={i} value={`${hour}:00${period}`}>
                      {`${hour}:00${period}`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Create Event Button */}
        <div className="mt-8 flex justify-end">
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => console.log('Create event clicked')}
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;