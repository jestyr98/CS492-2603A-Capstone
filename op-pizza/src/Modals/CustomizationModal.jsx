import { useEffect, useRef, useState } from 'react'

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
  const [selectedComboPizzaSize, setSelectedComboPizzaSize] = useState('')
  const [selectedComboPizzaSauce, setSelectedComboPizzaSauce] = useState('')
  const [selectedComboPizzaToppings, setSelectedComboPizzaToppings] = useState([])
  const [selectedComboWingCoatingSauce, setSelectedComboWingCoatingSauce] = useState('')
  const [selectedComboWingDipSauce, setSelectedComboWingDipSauce] = useState('')
  const [selectedSliceOne, setSelectedSliceOne] = useState('')
  const [selectedDrink, setSelectedDrink] = useState('')
  const [selectedPizzaToppings, setSelectedPizzaToppings] = useState([])
  const [selectedSliceOneIngredients, setSelectedSliceOneIngredients] = useState([])
  const [selectedSliceTwoIngredients, setSelectedSliceTwoIngredients] = useState([])
  const [wingOrderCount, setWingOrderCount] = useState(1)
  const [selectedWingCoatingSauces, setSelectedWingCoatingSauces] = useState([''])
  const [selectedWingDipSauces, setSelectedWingDipSauces] = useState([''])
  const [useSameWingCoatingSauce, setUseSameWingCoatingSauce] = useState(false)
  const [useSameWingDipSauce, setUseSameWingDipSauce] = useState(false)

  const [extraDips, setExtraDips] = useState({})
  const firstWingCoatingSelectRef = useRef(null)
  const firstWingDipSelectRef = useRef(null)
  const isWingCustomizationForFocus = Boolean(item?.options?.wingCoatingSauces || item?.options?.wingDipSauces)

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (isWingCustomizationForFocus && useSameWingCoatingSauce) {
      firstWingCoatingSelectRef.current?.focus()
    }
  }, [isWingCustomizationForFocus, useSameWingCoatingSauce])

  useEffect(() => {
    if (isWingCustomizationForFocus && useSameWingDipSauce) {
      firstWingDipSelectRef.current?.focus()
    }
  }, [isWingCustomizationForFocus, useSameWingDipSauce])

  if (!item) {
    return null
  }

  const isBuildYourOwnPizza = String(item.name || '').toLowerCase() === 'build your own pizza'
  const isWingCustomization = Boolean(item.options?.wingCoatingSauces || item.options?.wingDipSauces)
  const isComboCustomization = Boolean(item.options?.pizzaChoice && item.options?.wingChoice && item.options?.beverageChoice)
  const availableWingCoatingSauces = item.options?.wingCoatingSauces || item.options?.sauceOne || []
  const availableWingDipSauces = item.options?.wingDipSauces || item.options?.dip || []
  const availableComboWingCoatingSauces = item.options?.comboWingCoatingSauces || []
  const availableComboWingDipSauces = item.options?.comboWingDipSauces || []
  const availableComboPizzaSauces = item.options?.comboPizzaSauces || []
  const availableComboPizzaToppings = item.options?.comboPizzaToppings || []
  const availableComboPizzaSizes = item.options?.comboPizzaSizes || []
  const isComboBuildYourOwnPizza = isComboCustomization && selectedPizzaChoice === 'Build Your Own Pizza'
  const wingOrderUnit = Number(item.options?.wingOrderUnit || 10)

  const buildYourOwnExtraPriceBySize = {
    Personal: 0.5,
    Medium: 1,
    Large: 1.5,
  }
  const buildYourOwnExtraUnitPrice = buildYourOwnExtraPriceBySize[selectedSize] || 1

  const sizePrice = item.basePrice?.[selectedSize] || Number(item.price?.replace('$', '')) || 0
  const wingBasePrice = isWingCustomization ? sizePrice * wingOrderCount : sizePrice

  const extrasPrice = selectedExtras.reduce((total, extra) => {
    if (isBuildYourOwnPizza) {
      return total + buildYourOwnExtraUnitPrice
    }

    return total + extra.price
  }, 0)

  const extraDipsPrice = Object.values(extraDips).reduce((total, dip) => {
    return total + dip.price * dip.quantity
  }, 0)

  const includedToppingsCount = Number(item.options?.includedToppingsCount || 0)
  const extraToppingPrice = Number(item.options?.extraToppingPrice || 0)
  const extraSelectedToppings = Math.max(0, selectedPizzaToppings.length - includedToppingsCount)
  const extraPizzaToppingsPrice = extraSelectedToppings * extraToppingPrice
  const extraSelectedSliceIngredients = Math.max(0, selectedSliceOneIngredients.length - includedToppingsCount)
  const extraSliceIngredientsPrice = extraSelectedSliceIngredients * extraToppingPrice
  const extraSelectedSliceTwoIngredients = Math.max(0, selectedSliceTwoIngredients.length - includedToppingsCount)
  const extraSliceTwoIngredientsPrice = extraSelectedSliceTwoIngredients * extraToppingPrice

  const finalPrice = wingBasePrice + extrasPrice + extraDipsPrice + extraPizzaToppingsPrice + extraSliceIngredientsPrice + extraSliceTwoIngredientsPrice

  const normalizedWingCoatingSauces = useSameWingCoatingSauce
    ? Array.from({ length: wingOrderCount }, () => selectedWingCoatingSauces[0] || '')
    : selectedWingCoatingSauces

  const normalizedWingDipSauces = useSameWingDipSauce
    ? Array.from({ length: wingOrderCount }, () => selectedWingDipSauces[0] || '')
    : selectedWingDipSauces

  const isMissingLunchSelections = (
    (item.options?.sliceOne && !selectedSliceOne)
    || (item.options?.sliceOneIngredients && selectedSliceOneIngredients.length === 0)
    || (item.options?.sliceTwo && !selectedSliceOne)
    || (item.options?.sliceTwoIngredients && selectedSliceTwoIngredients.length === 0)
    || (item.options?.drink && !selectedDrink)
  )

  const isMissingComboSelections = (
    (item.options?.pizzaChoice && !selectedPizzaChoice)
    || (item.options?.wingChoice && !selectedWingChoice)
    || (item.options?.beverageChoice && !selectedBeverageChoice)
    || (isComboBuildYourOwnPizza && !selectedComboPizzaSize)
    || (isComboCustomization && selectedWingChoice && availableComboWingCoatingSauces.length > 0 && !selectedComboWingCoatingSauce)
    || (isComboCustomization && selectedWingChoice && availableComboWingDipSauces.length > 0 && !selectedComboWingDipSauce)
  )

  const isMissingWingSelections = (
    isWingCustomization && (
      normalizedWingCoatingSauces.some((sauce) => !sauce)
      || normalizedWingDipSauces.some((dip) => !dip)
    )
  )

  const isAddDisabled = isMissingLunchSelections || isMissingComboSelections || isMissingWingSelections

  const addDisabledMessage = isMissingLunchSelections
    ? 'Select both slices and a drink to continue.'
    : isMissingComboSelections
      ? 'Select pizza, wings, beverage, and required combo customizations to continue.'
      : isMissingWingSelections
        ? `Select one coating sauce and one dipping sauce per ${wingOrderUnit}-wing order.`
        : ''

  const renderSection = (title, content, defaultOpen = false, note = '') => (
    <details className="customize-section" open={defaultOpen}>
      <summary className="customize-summary">{title}</summary>
      <div className="customize-body">
        {note && <p className="customize-note">{note}</p>}
        {content}
      </div>
    </details>
  )

  return (
    <div className="login-modal" role="presentation">
      <div
        className="login-box customization-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customization-modal-title"
      >
        <h2 id="customization-modal-title">Customize {item.name}</h2>

        <div className="customize-content">

        {item.options?.size && (
          renderSection('Choose Size', (
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
          ), true)
        )}

        {item.options?.sliceOne && (
          renderSection('Choose First Slice', (
            <select
              value={selectedSliceOne}
              onChange={(e) => setSelectedSliceOne(e.target.value)}
            >
              <option value="">Choose First Slice</option>
              {item.options.sliceOne.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {item.options?.sliceOneIngredients && (
          renderSection(
            'Choose First Slice Ingredients',
            (
              <div className="topping-options">
                {item.options.sliceOneIngredients.map((option) => (
                  <label key={option} className="topping-option">
                    <input
                      type="checkbox"
                      checked={selectedSliceOneIngredients.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSliceOneIngredients([...selectedSliceOneIngredients, option])
                        } else {
                          setSelectedSliceOneIngredients(
                            selectedSliceOneIngredients.filter((ingredient) => ingredient !== option)
                          )
                        }
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ),
            true,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.sliceTwo && (
          renderSection('Choose Second Slice', (
            <select
              value={selectedSliceOne}
              onChange={(e) => setSelectedSliceOne(e.target.value)}
            >
              <option value="">Choose Second Slice</option>
              {item.options.sliceTwo.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {item.options?.sliceTwoIngredients && (
          renderSection(
            'Choose Second Slice Ingredients',
            (
              <div className="topping-options">
                {item.options.sliceTwoIngredients.map((option) => (
                  <label key={option} className="topping-option">
                    <input
                      type="checkbox"
                      checked={selectedSliceTwoIngredients.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSliceTwoIngredients([...selectedSliceTwoIngredients, option])
                        } else {
                          setSelectedSliceTwoIngredients(
                            selectedSliceTwoIngredients.filter((ingredient) => ingredient !== option)
                          )
                        }
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ),
            true,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.drink && (
          renderSection('Choose Drink', (
            <select
              value={selectedDrink}
              onChange={(e) => setSelectedDrink(e.target.value)}
            >
              <option value="">Choose Drink</option>
              {item.options.drink.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {item.options?.pizzaToppings && (
          renderSection(
            'Choose Pizza Toppings',
            (
              <div className="topping-options">
                {item.options.pizzaToppings.map((option) => (
                  <label key={option} className="topping-option">
                    <input
                      type="checkbox"
                      checked={selectedPizzaToppings.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPizzaToppings([...selectedPizzaToppings, option])
                        } else {
                          setSelectedPizzaToppings(
                            selectedPizzaToppings.filter((topping) => topping !== option)
                          )
                        }
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ),
            false,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.pizzaChoice && (
          renderSection('Choose Pizza', (
            <select
              value={selectedPizzaChoice}
              required={Boolean(item.options?.pizzaChoice)}
              aria-required={Boolean(item.options?.pizzaChoice)}
              onChange={(e) => {
                const nextPizza = e.target.value
                setSelectedPizzaChoice(nextPizza)

                if (nextPizza !== 'Build Your Own Pizza') {
                  setSelectedComboPizzaSize('')
                }
              }}
            >
              <option value="">Choose Pizza</option>
              {item.options.pizzaChoice.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {isComboCustomization && selectedPizzaChoice && availableComboPizzaSauces.length > 0 && (
          renderSection('Choose Pizza Sauce', (
            <select
              value={selectedComboPizzaSauce}
              onChange={(e) => setSelectedComboPizzaSauce(e.target.value)}
            >
              <option value="">Keep default sauce</option>
              {availableComboPizzaSauces.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {isComboBuildYourOwnPizza && availableComboPizzaSizes.length > 0 && (
          renderSection('Choose Build Your Own Size', (
            <select
              value={selectedComboPizzaSize}
              required={isComboBuildYourOwnPizza}
              aria-required={isComboBuildYourOwnPizza}
              onChange={(e) => setSelectedComboPizzaSize(e.target.value)}
            >
              <option value="">Choose Size</option>
              {availableComboPizzaSizes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ), true)
        )}

        {isComboCustomization && selectedPizzaChoice && availableComboPizzaToppings.length > 0 && (
          renderSection('Customize Pizza Toppings', (
            <div className="topping-options">
              {availableComboPizzaToppings.map((option) => (
                <label key={option} className="topping-option">
                  <input
                    type="checkbox"
                    checked={selectedComboPizzaToppings.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedComboPizzaToppings([...selectedComboPizzaToppings, option])
                        return
                      }

                      setSelectedComboPizzaToppings(
                        selectedComboPizzaToppings.filter((topping) => topping !== option)
                      )
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))
        )}

        {item.options?.wingChoice && (
          renderSection('Choose Wings', (
            <select
              value={selectedWingChoice}
              required={Boolean(item.options?.wingChoice)}
              aria-required={Boolean(item.options?.wingChoice)}
              onChange={(e) => {
                const nextWings = e.target.value
                setSelectedWingChoice(nextWings)

                if (!nextWings) {
                  setSelectedComboWingCoatingSauce('')
                  setSelectedComboWingDipSauce('')
                }
              }}
            >
              <option value="">Choose Wings</option>
              {item.options.wingChoice.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {isComboCustomization && selectedWingChoice && availableComboWingCoatingSauces.length > 0 && (
          renderSection('Choose Wing Coating Sauce', (
            <select
              value={selectedComboWingCoatingSauce}
              required={Boolean(selectedWingChoice && availableComboWingCoatingSauces.length > 0)}
              aria-required={Boolean(selectedWingChoice && availableComboWingCoatingSauces.length > 0)}
              onChange={(e) => setSelectedComboWingCoatingSauce(e.target.value)}
            >
              <option value="">Choose Coating Sauce</option>
              {availableComboWingCoatingSauces.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {isComboCustomization && selectedWingChoice && availableComboWingDipSauces.length > 0 && (
          renderSection('Choose Wing Dipping Sauce', (
            <select
              value={selectedComboWingDipSauce}
              required={Boolean(selectedWingChoice && availableComboWingDipSauces.length > 0)}
              aria-required={Boolean(selectedWingChoice && availableComboWingDipSauces.length > 0)}
              onChange={(e) => setSelectedComboWingDipSauce(e.target.value)}
            >
              <option value="">Choose Dipping Sauce</option>
              {availableComboWingDipSauces.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {item.options?.beverageChoice && (
          renderSection('Choose Beverage', (
            <select
              value={selectedBeverageChoice}
              required={Boolean(item.options?.beverageChoice)}
              aria-required={Boolean(item.options?.beverageChoice)}
              onChange={(e) => setSelectedBeverageChoice(e.target.value)}
            >
              <option value="">Choose Beverage</option>
              {item.options.beverageChoice.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {isWingCustomization && (
          renderSection('Wing Quantity', (
            <input
              type="number"
              min="1"
              step="1"
              value={wingOrderCount}
              onChange={(e) => {
                const parsed = Number(e.target.value)
                const nextCount = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
                setWingOrderCount(nextCount)
                setSelectedWingCoatingSauces((prev) => {
                  if (useSameWingCoatingSauce) {
                    return [prev[0] || '']
                  }

                  const next = prev.slice(0, nextCount)
                  while (next.length < nextCount) {
                    next.push('')
                  }
                  return next
                })
                setSelectedWingDipSauces((prev) => {
                  if (useSameWingDipSauce) {
                    return [prev[0] || '']
                  }

                  const next = prev.slice(0, nextCount)
                  while (next.length < nextCount) {
                    next.push('')
                  }
                  return next
                })
              }}
            />
          ), true, `Quantity is in orders of ${wingOrderUnit} wings. ${wingOrderCount} order(s) = ${wingOrderCount * wingOrderUnit} wings.`)
        )}

        {isWingCustomization && availableWingCoatingSauces.length > 0 && (
          renderSection('Choose Coating Sauce(s)', (
            <div className="topping-options">
              <label className="topping-option">
                <input
                  type="checkbox"
                  checked={useSameWingCoatingSauce}
                  onChange={(e) => {
                    const shouldUseSame = e.target.checked
                    setUseSameWingCoatingSauce(shouldUseSame)
                    if (shouldUseSame) {
                      setSelectedWingCoatingSauces((prev) => [prev[0] || ''])
                      return
                    }

                    setSelectedWingCoatingSauces((prev) => {
                      const first = prev[0] || ''
                      return Array.from({ length: wingOrderCount }, () => first)
                    })
                  }}
                />
                Use same coating sauce for all orders
              </label>

              {(useSameWingCoatingSauce ? selectedWingCoatingSauces.slice(0, 1) : selectedWingCoatingSauces).map((selectedSauce, index) => (
                <label key={`wing-coating-${index}`} className="topping-option">
                  Coating Sauce #{index + 1}
                  <select
                    ref={index === 0 ? firstWingCoatingSelectRef : null}
                    value={selectedSauce}
                    required={isWingCustomization}
                    aria-required={isWingCustomization}
                    onChange={(e) => {
                      const next = [...(useSameWingCoatingSauce ? selectedWingCoatingSauces.slice(0, 1) : selectedWingCoatingSauces)]
                      next[index] = e.target.value
                      setSelectedWingCoatingSauces(next)
                    }}
                  >
                    <option value="">Choose Coating Sauce</option>
                    {availableWingCoatingSauces.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ), true, `You get one coating sauce per ${wingOrderUnit}-wing order. If all orders use the same coating, enable the checkbox to choose it once.`)
        )}

        {isWingCustomization && availableWingDipSauces.length > 0 && (
          renderSection('Choose Dipping Sauce(s)', (
            <div className="topping-options">
              <label className="topping-option">
                <input
                  type="checkbox"
                  checked={useSameWingDipSauce}
                  onChange={(e) => {
                    const shouldUseSame = e.target.checked
                    setUseSameWingDipSauce(shouldUseSame)
                    if (shouldUseSame) {
                      setSelectedWingDipSauces((prev) => [prev[0] || ''])
                      return
                    }

                    setSelectedWingDipSauces((prev) => {
                      const first = prev[0] || ''
                      return Array.from({ length: wingOrderCount }, () => first)
                    })
                  }}
                />
                Use same dipping sauce for all orders
              </label>

              {(useSameWingDipSauce ? selectedWingDipSauces.slice(0, 1) : selectedWingDipSauces).map((selectedSauce, index) => (
                <label key={`wing-dip-${index}`} className="topping-option">
                  Dipping Sauce #{index + 1}
                  <select
                    ref={index === 0 ? firstWingDipSelectRef : null}
                    value={selectedSauce}
                    required={isWingCustomization}
                    aria-required={isWingCustomization}
                    onChange={(e) => {
                      const next = [...(useSameWingDipSauce ? selectedWingDipSauces.slice(0, 1) : selectedWingDipSauces)]
                      next[index] = e.target.value
                      setSelectedWingDipSauces(next)
                    }}
                  >
                    <option value="">Choose Dipping Sauce</option>
                    {availableWingDipSauces.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          ), true, `You get one dipping sauce per ${wingOrderUnit}-wing order. If all orders use the same dip, enable the checkbox to choose it once.`)
        )}

        {item.options?.dressing && (
          renderSection('Choose Dressing', (
            <select
              value={selectedDressing}
              onChange={(e) => setSelectedDressing(e.target.value)}
            >
              <option value="">Choose Dressing</option>
              {item.options.dressing.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {!isWingCustomization && item.options?.sauceOne && (
          renderSection('Choose First Sauce', (
            <select
              value={selectedSauceOne}
              onChange={(e) => setSelectedSauceOne(e.target.value)}
            >
              <option value="">Choose First Sauce</option>
              {item.options.sauceOne.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {!isWingCustomization && item.options?.sauceTwo && (
          renderSection('Choose Second Sauce', (
            <select
              value={selectedSauceTwo}
              onChange={(e) => setSelectedSauceTwo(e.target.value)}
            >
              <option value="">Choose Second Sauce</option>
              {item.options.sauceTwo.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {!isWingCustomization && item.options?.dip && (
          renderSection('Choose Dip', (
            <select
              value={selectedDip}
              onChange={(e) => setSelectedDip(e.target.value)}
            >
              <option value="">Choose Dip</option>
              {item.options.dip.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          ))
        )}

        {item.options?.extraDips && (
          renderSection('Extra Dips', (
            <div className="topping-options">
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
          ))
        )}

        {item.options?.removeToppings && (
          renderSection(
            'Customize Toppings',
            (
              <div className="topping-options">
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
            ),
            false,
            'Uncheck any toppings you want removed.'
          )
        )}

        {!isWingCustomization && item.options?.removeIngredients && (
          renderSection(
            'Customize Ingredients',
            (
              <div className="topping-options">
                {item.options.removeIngredients.map((option) => (
                  <label key={option} className="topping-option">
                    <input
                      type="checkbox"
                      checked={!removedIngredients.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRemovedIngredients(
                            removedIngredients.filter((ingredient) => ingredient !== option)
                          )
                        } else {
                          setRemovedIngredients([...removedIngredients, option])
                        }
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            ),
            false,
            'Uncheck any ingredients you want removed.'
          )
        )}

        {item.options?.addExtras && (
          renderSection('Add Extras', (
            <div className="topping-options">
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
                  {option.name} (+${(isBuildYourOwnPizza ? buildYourOwnExtraUnitPrice : option.price).toFixed(2)})
                </label>
              ))}
            </div>
          ))
        )}

        </div>

        <div className="customize-actions">
          <button
            className="customize-add-button"
            type="button"
            disabled={isAddDisabled}
            onClick={() =>
              onAddToCart({
                ...item,
                selectedSize,
                removedToppings,
                selectedExtras: selectedExtras.map((extra) => ({
                  ...extra,
                  price: isBuildYourOwnPizza ? buildYourOwnExtraUnitPrice : extra.price,
                })),
                selectedSauceOne,
                selectedSauceTwo,
                selectedDip: !isWingCustomization ? selectedDip : undefined,
                selectedDressing,
                removedIngredients,
                extraDips,
                selectedPizzaChoice,
                selectedComboPizzaSize,
                selectedComboPizzaSauce,
                selectedComboPizzaToppings,
                selectedWingChoice,
                selectedComboWingCoatingSauce,
                selectedComboWingDipSauce,
                selectedBeverageChoice,
                selectedSliceOne,
                selectedDrink,
                selectedSliceOneIngredients,
                selectedSliceTwoIngredients,
                selectedPizzaToppings,
                wingOrderCount,
                wingQuantity: isWingCustomization ? wingOrderCount * wingOrderUnit : undefined,
                selectedWingCoatingSauces: isWingCustomization ? normalizedWingCoatingSauces : undefined,
                selectedWingDipSauces: isWingCustomization ? normalizedWingDipSauces : undefined,
                useSameWingCoatingSauce: isWingCustomization ? useSameWingCoatingSauce : undefined,
                useSameWingDipSauce: isWingCustomization ? useSameWingDipSauce : undefined,
                price: `$${finalPrice.toFixed(2)}`,
                cartId: `${item.name}-${Date.now()}`,
              })
            }
          >
            Add to Cart - ${finalPrice.toFixed(2)}
          </button>

          {isAddDisabled && (
            <p className="customize-validation" role="status">
              {addDisabledMessage}
            </p>
          )}

          <button className="customize-cancel-button" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomizationModal