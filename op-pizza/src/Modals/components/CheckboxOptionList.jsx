function CheckboxOptionList({ options, selectedValues, onToggle }) {
  return (
    <div className="topping-options">
      {(options || []).map((option) => (
        <label key={option} className="topping-option">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={(event) => onToggle(option, event.target.checked)}
          />
          {option}
        </label>
      ))}
    </div>
  )
}

export default CheckboxOptionList
