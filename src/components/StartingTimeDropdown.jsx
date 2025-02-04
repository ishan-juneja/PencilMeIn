import Select from 'react-dropdown-select';

const items = [
  { label: '6:00AM', value: '6' },
  { label: '7:00AM', value: 'est' },
  { label: '8:00AM', value: 'utc' },
  { label: '9:00AM', value: 'ist' },
  { label: '10:00AM', value: 'cst' },
  { label: '11:00AM', value: 'jst' },
  { label: '12:00AM', value: 'ast' },
  { label: '1:00PM', value: 'gmt' },
  { label: '2:00PM', value: 'gmt' },
  { label: '3:00PM', value: 'gmt' },
  { label: '4:00PM', value: 'gmt' },
  { label: '5:00PM', value: 'gmt' },
  { label: '6:00PM', value: 'gmt' },
  { label: '7:00PM', value: 'gmt' },
  { label: '8:00PM', value: 'gmt' },
  { label: '9:00PM', value: 'gmt' },
];

function StartingTimeDropdown() {
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

export default StartingTimeDropdown;