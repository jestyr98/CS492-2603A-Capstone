import NumberInputControl from './NumberInputControl'

function QuantityOptionList({
  options,
  getKey,
  getLabel,
  getValue,
  onChangeQuantity,
  min = '0',
  step = '1',
}) {
  return (
    <div className="topping-options">
      {(options || []).map((option) => {
        const key = getKey(option)

        return (
          <label key={key} className="topping-option">
            {getLabel(option)}
            <NumberInputControl
              value={getValue(option)}
              min={min}
              step={step}
              onChange={(nextQuantity) => onChangeQuantity(option, nextQuantity)}
            />
          </label>
        )
      })}
    </div>
  )
}

export default QuantityOptionList
