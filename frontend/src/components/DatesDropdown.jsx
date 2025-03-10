import Select from 'react-dropdown-select'
import './ui/Dropdown.css'
import './DatesDropdown.css'
import { useState } from 'react'

const items = [
  { label: 'Specific Dates', value: 'Specific Dates' },
  { label: 'Days of the Week', value: 'Days of the Week' }
];

function DatesDropdown(props) {

  const [open, setOpen] = useState(false);

  return (
    <div className="dates-dropdown">
      <p className='dates-dropdown-text' onClick={() => setOpen(!open)}>{props.dateOption}</p>

      {open && (
        <div className='dates-dropdown-popup'> 
          {items.map((item) => (
            <div 
                key={item.value} 
                className="dates-dropdown-option"
                onClick={() => {
                    props.setDateOption(item.label);
                    setOpen(false);
                }}
            >
                {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DatesDropdown;