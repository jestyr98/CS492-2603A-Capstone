function SelectControl({
  value,
  onChange,
  options,
  placeholder,
  required = false,
  ariaRequired = false,
  selectRef,
}) {
  return (
    <select
      ref={selectRef}
      value={value}
      required={required}
      aria-required={ariaRequired}
      onChange={(event) => onChange(event.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {(options || []).map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  )
}

export default SelectControl
