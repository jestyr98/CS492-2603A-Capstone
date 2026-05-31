function SelectControl({
  value,
  onChange,
  options,
  placeholder,
  required = false,
  ariaRequired = false,
  ariaLabel,
  selectRef,
}) {
  return (
    <select
      ref={selectRef}
      value={value}
      required={required}
      aria-required={ariaRequired}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {(options || []).map((option) => {
        if (typeof option === 'object' && option !== null) {
          const optionValue = option.value ?? ''
          const optionLabel = option.label ?? String(optionValue)

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        }

        return (
          <option key={option} value={option}>
            {option}
          </option>
        )
      })}
    </select>
  )
}

export default SelectControl
