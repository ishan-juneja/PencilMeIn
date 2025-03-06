import Select from 'react-dropdown-select';
import './ui/Dropdown.css'

const items = [
  { label: 'PT', value: 'pt' },
  { label: 'EST', value: 'est' },
  { label: 'UTC', value: 'utc' },
  { label: 'IST', value: 'ist' },
  { label: 'CST', value: 'cst' },
  { label: 'JST', value: 'jst' },
  { label: 'AST', value: 'ast' },
  { label: 'GMT', value: 'gmt' },
];

function TimezoneDropdown() {
  return (
    <Select
      className='dropdown'
      options={items}
      values={[]}
      onChange={(value) => console.log(value)}
      placeholder="Select Time Zone"
      style={{
        width: '600px',
        minWidth: '450px'
      }}
    />
  );
}

export default TimezoneDropdown;