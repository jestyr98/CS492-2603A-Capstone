import { useEffect, useRef, useState } from 'react'
import CheckboxToggleList from './components/CheckboxToggleList'
import CheckboxOptionList from './components/CheckboxOptionList'
import ModalShell from './components/ModalShell'
import NumberInputControl from './components/NumberInputControl'
import QuantityOptionList from './components/QuantityOptionList'
import SaucePerOrderSection from './components/SaucePerOrderSection'
import SelectControl from './components/SelectControl'
import useEscapeToClose from '../hooks/useEscapeToClose'

function CustomizationModal({ item, onClose, onAddToCart }) {
  const defaultSize = item.options?.size?.includes('Large')
    ? 'Large'
    : (item.options?.size?.[0] || '')

  const [selectedSize, setSelectedSize] = useState(defaultSize)
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
  const [selectedSliceTwo, setSelectedSliceTwo] = useState('')
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

  useEscapeToClose(onClose)

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
  const sizeOptions = (item.options?.size || []).map((option) => ({
    value: option,
    label: `${option} - $${item.basePrice[option].toFixed(2)}`,
  }))

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
    || (item.options?.sliceTwo && !selectedSliceTwo)
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

  const createValueSelectionToggle = (setState) => (value, isChecked) => {
    setState((prev) => {
      if (isChecked) {
        return prev.includes(value) ? prev : [...prev, value]
      }

      return prev.filter((entry) => entry !== value)
    })
  }

  const createValueRemovalToggle = (setState) => (value, isChecked) => {
    setState((prev) => {
      if (isChecked) {
        return prev.filter((entry) => entry !== value)
      }

      return prev.includes(value) ? prev : [...prev, value]
    })
  }

  const createNamedObjectToggle = (setState) => (option, isChecked) => {
    setState((prev) => {
      if (isChecked) {
        return prev.some((entry) => entry.name === option.name) ? prev : [...prev, option]
      }

      return prev.filter((entry) => entry.name !== option.name)
    })
  }

  const handleSliceOneIngredientToggle = createValueSelectionToggle(setSelectedSliceOneIngredients)
  const handleSliceTwoIngredientToggle = createValueSelectionToggle(setSelectedSliceTwoIngredients)
  const handlePizzaToppingToggle = createValueSelectionToggle(setSelectedPizzaToppings)
  const handleComboPizzaToppingToggle = createValueSelectionToggle(setSelectedComboPizzaToppings)
  const handleRemovedToppingsToggle = createValueRemovalToggle(setRemovedToppings)
  const handleRemovedIngredientsToggle = createValueRemovalToggle(setRemovedIngredients)
  const handleSelectedExtrasToggle = createNamedObjectToggle(setSelectedExtras)

  return (
    <ModalShell
      ariaLabelledBy="customization-modal-title"
      boxClassName="login-box customization-box"
    >
        <h2 id="customization-modal-title">Customize {item.name}</h2>

        <div className="customize-content">

        {item.options?.size && (
          renderSection('Choose Size', (
            <SelectControl
              value={selectedSize}
              onChange={setSelectedSize}
              options={sizeOptions}
              ariaLabel="Choose size"
            />
          ), true)
        )}

        {item.options?.sliceOne && (
          renderSection('Choose First Slice', (
            <SelectControl
              value={selectedSliceOne}
              onChange={setSelectedSliceOne}
              options={item.options.sliceOne}
              placeholder="Choose First Slice"
              ariaLabel="Choose first slice"
            />
          ))
        )}

        {item.options?.sliceOneIngredients && (
          renderSection(
            'Choose First Slice Ingredients',
            <CheckboxOptionList
              options={item.options.sliceOneIngredients}
              selectedValues={selectedSliceOneIngredients}
              onToggle={handleSliceOneIngredientToggle}
            />,
            true,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.sliceTwo && (
          renderSection('Choose Second Slice', (
            <SelectControl
              value={selectedSliceTwo}
              onChange={setSelectedSliceTwo}
              options={item.options.sliceTwo}
              placeholder="Choose Second Slice"
              ariaLabel="Choose second slice"
            />
          ))
        )}

        {item.options?.sliceTwoIngredients && (
          renderSection(
            'Choose Second Slice Ingredients',
            <CheckboxOptionList
              options={item.options.sliceTwoIngredients}
              selectedValues={selectedSliceTwoIngredients}
              onToggle={handleSliceTwoIngredientToggle}
            />,
            true,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.drink && (
          renderSection('Choose Drink', (
            <SelectControl
              value={selectedDrink}
              onChange={setSelectedDrink}
              options={item.options.drink}
              placeholder="Choose Drink"
              ariaLabel="Choose drink"
            />
          ))
        )}

        {item.options?.pizzaToppings && (
          renderSection(
            'Choose Pizza Toppings',
            <CheckboxOptionList
              options={item.options.pizzaToppings}
              selectedValues={selectedPizzaToppings}
              onToggle={handlePizzaToppingToggle}
            />,
            false,
            `First ${includedToppingsCount} toppings are included. Additional toppings are +$${extraToppingPrice.toFixed(2)} each.`
          )
        )}

        {item.options?.pizzaChoice && (
          renderSection('Choose Pizza', (
            <SelectControl
              value={selectedPizzaChoice}
              onChange={(nextPizza) => {
                setSelectedPizzaChoice(nextPizza)

                if (nextPizza !== 'Build Your Own Pizza') {
                  setSelectedComboPizzaSize('')
                }
              }}
              options={item.options.pizzaChoice}
              placeholder="Choose Pizza"
              required={Boolean(item.options?.pizzaChoice)}
              ariaRequired={Boolean(item.options?.pizzaChoice)}
              ariaLabel="Choose pizza"
            />
          ))
        )}

        {isComboCustomization && selectedPizzaChoice && availableComboPizzaSauces.length > 0 && (
          renderSection('Choose Pizza Sauce', (
            <SelectControl
              value={selectedComboPizzaSauce}
              onChange={setSelectedComboPizzaSauce}
              options={availableComboPizzaSauces}
              placeholder="Keep default sauce"
              ariaLabel="Choose pizza sauce"
            />
          ))
        )}

        {isComboBuildYourOwnPizza && availableComboPizzaSizes.length > 0 && (
          renderSection('Choose Build Your Own Size', (
            <SelectControl
              value={selectedComboPizzaSize}
              onChange={setSelectedComboPizzaSize}
              options={availableComboPizzaSizes}
              placeholder="Choose Size"
              required={isComboBuildYourOwnPizza}
              ariaRequired={isComboBuildYourOwnPizza}
              ariaLabel="Choose build your own pizza size"
            />
          ), true)
        )}

        {isComboCustomization && selectedPizzaChoice && availableComboPizzaToppings.length > 0 && (
          renderSection('Customize Pizza Toppings', (
            <CheckboxOptionList
              options={availableComboPizzaToppings}
              selectedValues={selectedComboPizzaToppings}
              onToggle={handleComboPizzaToppingToggle}
            />
          ))
        )}

        {item.options?.wingChoice && (
          renderSection('Choose Wings', (
            <SelectControl
              value={selectedWingChoice}
              onChange={(nextWings) => {
                setSelectedWingChoice(nextWings)

                if (!nextWings) {
                  setSelectedComboWingCoatingSauce('')
                  setSelectedComboWingDipSauce('')
                }
              }}
              options={item.options.wingChoice}
              placeholder="Choose Wings"
              required={Boolean(item.options?.wingChoice)}
              ariaRequired={Boolean(item.options?.wingChoice)}
              ariaLabel="Choose wings"
            />
          ))
        )}

        {isComboCustomization && selectedWingChoice && availableComboWingCoatingSauces.length > 0 && (
          renderSection('Choose Wing Coating Sauce', (
            <SelectControl
              value={selectedComboWingCoatingSauce}
              onChange={setSelectedComboWingCoatingSauce}
              options={availableComboWingCoatingSauces}
              placeholder="Choose Coating Sauce"
              required={Boolean(selectedWingChoice && availableComboWingCoatingSauces.length > 0)}
              ariaRequired={Boolean(selectedWingChoice && availableComboWingCoatingSauces.length > 0)}
              ariaLabel="Choose wing coating sauce"
            />
          ))
        )}

        {isComboCustomization && selectedWingChoice && availableComboWingDipSauces.length > 0 && (
          renderSection('Choose Wing Dipping Sauce', (
            <SelectControl
              value={selectedComboWingDipSauce}
              onChange={setSelectedComboWingDipSauce}
              options={availableComboWingDipSauces}
              placeholder="Choose Dipping Sauce"
              required={Boolean(selectedWingChoice && availableComboWingDipSauces.length > 0)}
              ariaRequired={Boolean(selectedWingChoice && availableComboWingDipSauces.length > 0)}
              ariaLabel="Choose wing dipping sauce"
            />
          ))
        )}

        {item.options?.beverageChoice && (
          renderSection('Choose Beverage', (
            <SelectControl
              value={selectedBeverageChoice}
              onChange={setSelectedBeverageChoice}
              options={item.options.beverageChoice}
              placeholder="Choose Beverage"
              required={Boolean(item.options?.beverageChoice)}
              ariaRequired={Boolean(item.options?.beverageChoice)}
              ariaLabel="Choose beverage"
            />
          ))
        )}

        {isWingCustomization && (
          renderSection('Wing Quantity', (
            <NumberInputControl
              value={wingOrderCount}
              min="1"
              step="1"
              onChange={(parsed) => {
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
            <SaucePerOrderSection
              values={selectedWingCoatingSauces}
              options={availableWingCoatingSauces}
              useSame={useSameWingCoatingSauce}
              onToggleUseSame={(shouldUseSame) => {
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
              onChangeAt={(index, nextValue, useSame) => {
                const next = [...(useSame ? selectedWingCoatingSauces.slice(0, 1) : selectedWingCoatingSauces)]
                next[index] = nextValue
                setSelectedWingCoatingSauces(next)
              }}
              sameLabel="Use same coating sauce for all orders"
              selectLabelPrefix="Coating Sauce"
              placeholder="Choose Coating Sauce"
              firstSelectRef={firstWingCoatingSelectRef}
              required={isWingCustomization}
            />
          ), true, `You get one coating sauce per ${wingOrderUnit}-wing order. If all orders use the same coating, enable the checkbox to choose it once.`)
        )}

        {isWingCustomization && availableWingDipSauces.length > 0 && (
          renderSection('Choose Dipping Sauce(s)', (
            <SaucePerOrderSection
              values={selectedWingDipSauces}
              options={availableWingDipSauces}
              useSame={useSameWingDipSauce}
              onToggleUseSame={(shouldUseSame) => {
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
              onChangeAt={(index, nextValue, useSame) => {
                const next = [...(useSame ? selectedWingDipSauces.slice(0, 1) : selectedWingDipSauces)]
                next[index] = nextValue
                setSelectedWingDipSauces(next)
              }}
              sameLabel="Use same dipping sauce for all orders"
              selectLabelPrefix="Dipping Sauce"
              placeholder="Choose Dipping Sauce"
              firstSelectRef={firstWingDipSelectRef}
              required={isWingCustomization}
            />
          ), true, `You get one dipping sauce per ${wingOrderUnit}-wing order. If all orders use the same dip, enable the checkbox to choose it once.`)
        )}

        {item.options?.dressing && (
          renderSection('Choose Dressing', (
            <SelectControl
              value={selectedDressing}
              onChange={setSelectedDressing}
              options={item.options.dressing}
              placeholder="Choose Dressing"
              ariaLabel="Choose dressing"
            />
          ))
        )}

        {!isWingCustomization && item.options?.sauceOne && (
          renderSection('Choose First Sauce', (
            <SelectControl
              value={selectedSauceOne}
              onChange={setSelectedSauceOne}
              options={item.options.sauceOne}
              placeholder="Choose First Sauce"
              ariaLabel="Choose first sauce"
            />
          ))
        )}

        {!isWingCustomization && item.options?.sauceTwo && (
          renderSection('Choose Second Sauce', (
            <SelectControl
              value={selectedSauceTwo}
              onChange={setSelectedSauceTwo}
              options={item.options.sauceTwo}
              placeholder="Choose Second Sauce"
              ariaLabel="Choose second sauce"
            />
          ))
        )}

        {!isWingCustomization && item.options?.dip && (
          renderSection('Choose Dip', (
            <SelectControl
              value={selectedDip}
              onChange={setSelectedDip}
              options={item.options.dip}
              placeholder="Choose Dip"
              ariaLabel="Choose dip"
            />
          ))
        )}

        {item.options?.extraDips && (
          renderSection('Extra Dips', (
            <QuantityOptionList
              options={item.options.extraDips}
              getKey={(dip) => dip.name}
              getLabel={(dip) => `${dip.name} (+$${dip.price.toFixed(2)} each)`}
              getValue={(dip) => extraDips[dip.name]?.quantity || 0}
              onChangeQuantity={(dip, quantity) => {
                setExtraDips({
                  ...extraDips,
                  [dip.name]: {
                    name: dip.name,
                    price: dip.price,
                    quantity,
                  },
                })
              }}
              min="0"
              step="1"
            />
          ))
        )}

        {item.options?.removeToppings && (
          renderSection(
            'Customize Toppings',
            <CheckboxOptionList
              options={item.options.removeToppings}
              selectedValues={item.options.removeToppings.filter((option) => !removedToppings.includes(option))}
              onToggle={handleRemovedToppingsToggle}
            />,
            false,
            'Uncheck any toppings you want removed.'
          )
        )}

        {!isWingCustomization && item.options?.removeIngredients && (
          renderSection(
            'Customize Ingredients',
            <CheckboxOptionList
              options={item.options.removeIngredients}
              selectedValues={item.options.removeIngredients.filter((option) => !removedIngredients.includes(option))}
              onToggle={handleRemovedIngredientsToggle}
            />,
            false,
            'Uncheck any ingredients you want removed.'
          )
        )}

        {item.options?.addExtras && (
          renderSection('Add Extras', (
            <CheckboxToggleList
              options={item.options.addExtras}
              getKey={(option) => option.name}
              getLabel={(option) => `${option.name} (+$${(isBuildYourOwnPizza ? buildYourOwnExtraUnitPrice : option.price).toFixed(2)})`}
              isChecked={(option) => selectedExtras.some((extra) => extra.name === option.name)}
              onToggle={handleSelectedExtrasToggle}
            />
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
                selectedSliceTwo,
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
    </ModalShell>
  )
}

export default CustomizationModal