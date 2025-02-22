import Select from 'react-dropdown-select';

const items = [
  { label: 'Specific Dates', value: 'dates' },
  { label: 'Days of the Week', value: 'days' }
];

function DatesDropdown() {
  return (
    <Select
      options={items}
      values={[]}
      onChange={(value) => console.log(value)}
      placeholder="Select Date Type"
      style={{
        width: '600px',  
        minWidth: '450px'
      }}
    />
  );
}

export default DatesDropdown;