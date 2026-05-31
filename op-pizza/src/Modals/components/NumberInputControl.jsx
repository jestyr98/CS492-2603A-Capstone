function NumberInputControl({
  value,
  onChange,
  min = '0',
  step = '1',
  inputMode,
  className,
}) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      inputMode={inputMode}
      className={className}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}

export default NumberInputControl
