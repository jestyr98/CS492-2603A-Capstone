import { useState } from 'react'

function CustomizationModal({ item, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(item.options?.size?.[2] || '')
  const [removedToppings, setRemovedToppings] = useState([])
  const [selectedExtras, setSelectedExtras] = useState([])

  const [selectedSauceOne, setSelectedSauceOne] = useState('')
  const [selectedSauceTwo, setSelectedSauceTwo] = useState('')
  const [selectedDip, setSelectedDip] = useState('')

  const [selectedDressing, setSelectedDressing] = useState('')
  const [removedIngredients, setRemovedIngredients] = useState([])

  const [selectedPizzaChoice, setSelectedPizzaChoice] = useState('')
  const [selectedWingChoice, setSelectedWingChoice] = useState('')
  const [selectedBeverageChoice, setSelectedBeverageChoice] = useState('')

  const [extraDips, setExtraDips] = useState({})

  if (!item) return null

const sizePrice = item.basePrice?.[selectedSize] || Number(item.price?.replace('$', '')) || 0

const extrasPrice = selectedExtras.reduce((total, extra) => {
  return total + extra.price
}, 0)

const extraDipsPrice = Object.values(extraDips).reduce((total, dip) => {
  return total + dip.price * dip.quantity
}, 0)

const finalPrice = sizePrice + extrasPrice + extraDipsPrice

  return (
    <div className="login-modal">
      <div className="login-box">
        <h2>Customize {item.name}</h2>

        {item.options?.size && (
          <div>
            <p className="customize-heading">Choose Size</p>

            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {item.options.size.map((option) => (
                <option key={option} value={option}>
                  {option} - ${item.basePrice[option].toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {item.options?.sliceOne && (
          <select>
            <option>Choose First Slice</option>

            {item.options.sliceOne.map((option) => (
              <option key={option}>{option}</option>
            ))}

          </select>
        )}

        {item.options?.sliceTwo && (
          <select>
            <option>Choose Second Slice</option>

            {item.options.sliceTwo.map((option) => (
              <option key={option}>{option}</option>
            ))}

          </select>
        )}

        {item.options?.drink && (
          <select>
            <option>Choose Drink</option>

            {item.options.drink.map((option) => (
              <option key={option}>{option}</option>
            ))}

          </select>
        )}

        {item.options?.pizzaChoice && (
  <select
    value={selectedPizzaChoice}
    onChange={(e) => setSelectedPizzaChoice(e.target.value)}
  >
    <option value="">Choose Pizza</option>

    {item.options.pizzaChoice.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

{item.options?.wingChoice && (
  <select
    value={selectedWingChoice}
    onChange={(e) => setSelectedWingChoice(e.target.value)}
  >
    <option value="">Choose Wings</option>

    {item.options.wingChoice.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

{item.options?.beverageChoice && (
  <select
    value={selectedBeverageChoice}
    onChange={(e) => setSelectedBeverageChoice(e.target.value)}
  >
    <option value="">Choose Beverage</option>

    {item.options.beverageChoice.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

        {item.options?.dressing && (
          <select
            value={selectedDressing}
            onChange={(e) => setSelectedDressing(e.target.value)}
          >
            <option value="">Choose Dressing</option>

            {item.options.dressing.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        )}

        {item.options?.sauceOne && (
  <select
    value={selectedSauceOne}
    onChange={(e) => setSelectedSauceOne(e.target.value)}
  >
    <option value="">Choose First Sauce</option>

    {item.options.sauceOne.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

{item.options?.sauceTwo && (
  <select
    value={selectedSauceTwo}
    onChange={(e) => setSelectedSauceTwo(e.target.value)}
  >
    <option value="">Choose Second Sauce</option>

    {item.options.sauceTwo.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

{item.options?.dip && (
  <select
    value={selectedDip}
    onChange={(e) => setSelectedDip(e.target.value)}
  >
    <option value="">Choose Dip</option>

    {item.options.dip.map((option) => (
      <option key={option}>{option}</option>
    ))}
  </select>
)}

{item.options?.extraDips && (
  <div className="topping-options">
    <p className="customize-heading">Extra Dips</p>

    {item.options.extraDips.map((dip) => (
      <label key={dip.name} className="topping-option">
        {dip.name} (+${dip.price.toFixed(2)} each)

        <input
          type="number"
          min="0"
          value={extraDips[dip.name]?.quantity || 0}
          onChange={(e) => {
            const quantity = Number(e.target.value)

            setExtraDips({
              ...extraDips,
              [dip.name]: {
                name: dip.name,
                price: dip.price,
                quantity,
              },
            })
          }}
        />
      </label>
    ))}
  </div>
)}

         {item.options?.removeToppings && (
          <div className="topping-options">
          <p className="customize-heading">Customize Toppings</p>
          <p className="customize-note">Uncheck any toppings you want removed.</p>

        {item.options.removeToppings.map((option) => (
          <label key={option} className="topping-option">
          <input
            type="checkbox"
            checked={!removedToppings.includes(option)}
            onChange={(e) => {
              if (e.target.checked) {
                setRemovedToppings(removedToppings.filter((topping) => topping !== option))
              } else {
                setRemovedToppings([...removedToppings, option])
            }
          }}
        />
          {option}
        </label>
      ))}
        </div>
      )}

      {item.options?.removeIngredients && (
        <div className="topping-options">
          <p className="customize-heading">Customize Ingredients</p>
          <p className="customize-note">Uncheck any ingredients you want removed.</p>

          {item.options.removeIngredients.map((option) => (
            <label key={option} className="topping-option">
              <input
                type="checkbox"
                checked={!removedIngredients.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRemovedIngredients(
                      removedIngredients.filter(
                        (ingredient) => ingredient !== option
                      )
                    )
                  } else {
                    setRemovedIngredients([
                      ...removedIngredients,
                      option
                    ])
                  }
                }}
              />
        {option}
      </label>
    ))}
  </div>
)}

        {item.options?.addExtras && (
          <div className="topping-options">
          <p className="customize-heading">Add Extras</p>

        {item.options.addExtras.map((option) => (
        <label key={option.name} className="topping-option">
          <input
            type="checkbox"
            checked={selectedExtras.some((extra) => extra.name === option.name)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedExtras([...selectedExtras, option])
              } else {
                setSelectedExtras(
                  selectedExtras.filter((extra) => extra.name !== option.name)
                )
              }
            }}
          />
            {option.name} (+${option.price.toFixed(2)})
        </label>
      ))}
    </div>
)}

        <button
          onClick={() =>
            onAddToCart({
            ...item,
            selectedSize,
            removedToppings,
            selectedExtras,

            selectedSauceOne,
            selectedSauceTwo,
            selectedDip,
            selectedDressing,
            removedIngredients,
            extraDips,
            selectedPizzaChoice,
            selectedWingChoice,
            selectedBeverageChoice,

            price: `$${finalPrice.toFixed(2)}`,
            cartId: `${item.name}-${Date.now()}`,
          })
        }
      >
        Add to Cart - ${finalPrice.toFixed(2)}
      </button>

        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default CustomizationModal