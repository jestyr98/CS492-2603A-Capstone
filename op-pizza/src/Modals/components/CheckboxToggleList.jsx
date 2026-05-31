function CheckboxToggleList({
  options,
  getKey,
  getLabel,
  isChecked,
  onToggle,
}) {
  return (
    <div className="topping-options">
      {(options || []).map((option) => {
        const key = getKey(option)

        return (
          <label key={key} className="topping-option">
            <input
              type="checkbox"
              checked={isChecked(option)}
              onChange={(event) => onToggle(option, event.target.checked)}
            />
            {getLabel(option)}
          </label>
        )
      })}
    </div>
  )
}

export default CheckboxToggleList
