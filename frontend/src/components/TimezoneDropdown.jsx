import Select from 'react-dropdown-select';
import { useState } from 'react'
import './TimezoneDropdown.css'
import './ui/Dropdown.css'

const items = [
  { label: 'Pacific Time', value: 'pt' },
  { label: 'Eastern Standard Time', value: 'est' },
  { label: 'UTC', value: 'utc' },
  { label: 'IST', value: 'ist' },
  { label: 'CST', value: 'cst' },
  { label: 'JST', value: 'jst' },
  { label: 'AST', value: 'ast' },
  { label: 'GMT', value: 'gmt' },
];

function TimezoneDropdown(props) {

  const [open, setOpen] = useState(false);

  return (
    <div className="timezone-dropdown">
    <p className='timezone-dropdown-text' onClick={() => setOpen(!open)}>{props.timeZone}</p>

    {open && (
      <div className='timezone-dropdown-popup'> 
        {items.map((item) => (
          <div 
              key={item.value} 
              className="timezone-dropdown-option"
              onClick={() => {
                  props.setTimeZone(item.label);
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

export default TimezoneDropdown;