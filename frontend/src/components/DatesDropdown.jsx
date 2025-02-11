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
      dropdownHandleRenderer={({ state }) => (
        <span>{state.dropdown ? '-' : 'v'}</span>
      )}
      onChange={(value) => console.log(value)}
    />
  );
}

export default DatesDropdown;