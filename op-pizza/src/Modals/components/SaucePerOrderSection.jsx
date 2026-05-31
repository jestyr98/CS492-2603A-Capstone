function SaucePerOrderSection({
  values,
  options,
  useSame,
  onToggleUseSame,
  onChangeAt,
  sameLabel,
  selectLabelPrefix,
  placeholder,
  firstSelectRef,
  required,
}) {
  const renderedValues = useSame ? values.slice(0, 1) : values

  return (
    <div className="topping-options">
      <label className="topping-option">
        <input
          type="checkbox"
          checked={useSame}
          onChange={(event) => onToggleUseSame(event.target.checked)}
        />
        {sameLabel}
      </label>

      {renderedValues.map((selectedSauce, index) => (
        <label key={`${selectLabelPrefix}-${index}`} className="topping-option">
          {selectLabelPrefix} #{index + 1}
          <select
            ref={index === 0 ? firstSelectRef : null}
            value={selectedSauce}
            required={required}
            aria-required={required}
            onChange={(event) => onChangeAt(index, event.target.value, useSame)}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}

export default SaucePerOrderSection
