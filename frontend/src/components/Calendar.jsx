import React, { useState } from "react";
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function CalendarSelection() {
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let nextMonth = month === 11 ? 0 : month + 1;
    let nextYear = nextMonth === 0 ? year + 1 : year;

    // Set first day of current month
    const currentMonth = new Date(year, month, 1);
    
    // Initialize with null instead of today's date
    const [date, setDate] = useState(null);
    const [visibleMonth, setVisibleMonth] = useState(currentMonth);

    // Set minDate to today to prevent selecting past dates
    let minDate = today;
    let maxDate = new Date();
    maxDate.setMonth(nextMonth);
    maxDate.setFullYear(nextYear);

    // Handle month navigation
    const onViewDateChange = (e) => {
        const newDate = new Date(e.value);
        // Only allow navigation to current or future months
        if (newDate.getFullYear() > year || 
            (newDate.getFullYear() === year && newDate.getMonth() >= month)) {
            setVisibleMonth(newDate);
        }
    };

    // Handle date selection
    const handleDateChange = (e) => {
        console.log("Date selected:", e.value);
        setDate(e.value);
    };

    return (
        <div className="card flex justify-content-center">
            <PrimeCalendar 
                value={date} 
                onChange={handleDateChange}
                minDate={minDate}
                maxDate={maxDate} 
                inline 
                className="large-calendar"
                showOtherMonths={false}
                dateFormat="mm/dd/yy"
                viewDate={visibleMonth}
                onViewDateChange={onViewDateChange}
                selectionMode="single"
                disabledDates={[]}
            />
        </div>
    );
}

export default CalendarSelection;