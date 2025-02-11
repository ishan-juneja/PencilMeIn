import Select from 'react-dropdown-select';

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
      options={items}
      values={[]}
      dropdownHandleRenderer={({ state }) => (
        <span>{state.dropdown ? '-' : 'v'}</span>
      )}
      onChange={(value) => console.log(value)}
    />
  );
}

export default TimezoneDropdown;