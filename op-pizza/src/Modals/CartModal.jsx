import { useMemo, useState } from 'react'
import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

const TAX_RATE = 0.08
const ORDER_FEE = 1.99
const DELIVERY_FEE = 3.99

function CartModal({
  cartItems,
  resolveItemImage,
  onClose,
  onRemove,
  onUpdateQuantity,
  onSubmitOrder,
}) {
  const [orderType, setOrderType] = useState('carryout')
  const [deliveryAddress, setDeliveryAddress] = useState({
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true)
  const [billingAddress, setBillingAddress] = useState({
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [tipPercent, setTipPercent] = useState(0)
  const [customTipAmount, setCustomTipAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [showSecurityCode, setShowSecurityCode] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState('')

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number.parseFloat(String(item.price || '').replace(/[^0-9.]/g, '')) || 0
      return sum + (price * item.quantity)
    }, 0)
  }, [cartItems])

  const fees = ORDER_FEE + (orderType === 'delivery' ? DELIVERY_FEE : 0)
  const taxes = Number(((subtotal + fees) * TAX_RATE).toFixed(2))
  const customTip = Number.parseFloat(customTipAmount)
  const tipAmount = orderType === 'delivery'
    ? Number((Number.isFinite(customTip) ? customTip : (subtotal * (tipPercent / 100))).toFixed(2))
    : 0
  const total = Number((subtotal + fees + taxes + tipAmount).toFixed(2))

  useEscapeToClose(onClose)

  const isDelivery = orderType === 'delivery'
  const isCardPayment = paymentMethod === 'card'

  const updateAddressField = (setter) => (field, value) => {
    setter((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateDeliveryAddress = updateAddressField(setDeliveryAddress)
  const updateBillingAddress = updateAddressField(setBillingAddress)

  const handleOrderTypeChange = (nextOrderType) => {
    setOrderType(nextOrderType)
    setCheckoutError('')
    setCheckoutSuccess('')

    if (nextOrderType === 'delivery' && paymentMethod === 'cash') {
      setPaymentMethod('card')
    }

    if (nextOrderType === 'carryout') {
      setTipPercent(0)
      setCustomTipAmount('')
    }
  }

  const handleTipSelection = (nextTipPercent) => {
    setTipPercent(nextTipPercent)
    setCustomTipAmount('')
  }

  const handleSubmitOrder = async () => {
    setCheckoutError('')
    setCheckoutSuccess('')

    if (cartItems.length === 0) {
      setCheckoutError('Add at least one item before submitting your order.')
      return
    }

    if (isDelivery) {
      if (!deliveryAddress.street1 || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.postalCode) {
        setCheckoutError('Delivery requires street, city, state, and ZIP code.')
        return
      }
    }

    if (!billingSameAsDelivery && isCardPayment) {
      if (!billingAddress.street1 || !billingAddress.city || !billingAddress.state || !billingAddress.postalCode) {
        setCheckoutError('Enter complete billing address details or select billing same as delivery.')
        return
      }
    }

    if (isCardPayment) {
      if (!cardNumber || !securityCode || !expiryMonth || !expiryYear) {
        setCheckoutError('Card payment requires card number, security code, and expiration date.')
        return
      }
    }

    const checkoutPayload = {
      cartItems,
      orderType,
      deliveryAddress: isDelivery ? deliveryAddress : null,
      billingAddress: billingSameAsDelivery
        ? (isDelivery ? deliveryAddress : null)
        : billingAddress,
      paymentMethod,
      tipAmount,
      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        taxes,
        fees: Number(fees.toFixed(2)),
        total,
      },
      paymentCard: isCardPayment
        ? {
          cardNumber,
          expiryMonth: Number(expiryMonth),
          expiryYear: Number(expiryYear),
          cvv: securityCode,
          cardholderName: 'Checkout Customer',
        }
        : null,
    }

    try {
      const result = await onSubmitOrder?.(checkoutPayload)
      setCheckoutSuccess(result?.message || 'Order submitted successfully.')
    } catch (error) {
      setCheckoutError(error?.message || 'Unable to submit order right now.')
    }
  }

  return (
    <ModalShell
      overlayClassName="cart-modal"
      boxClassName="cart-box"
      ariaLabelledBy="cart-modal-title"
    >
        <h2 id="cart-modal-title">Your Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item.cartId || item.id || item.name} className="cart-item">
                  <div className="cart-item_media">
                    {resolveItemImage?.(item.photoPath) ? (
                      <img
                        className="cart-item_image"
                        src={resolveItemImage(item.photoPath)}
                        alt={item.name}
                      />
                    ) : (
                      <div className="cart-item_image cart-item_image-placeholder" aria-hidden="true" />
                    )}
                  </div>

                  <div className="cart-item_details">
                    <span className="cart-item_name">{item.name}</span>
                    <span className="cart-item_price">{item.price}</span>

                    <div className="cart-item_qty">
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${item.name}`}
                        onClick={() => onUpdateQuantity(item.cartId || item.id || item.name, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity for ${item.name}`}
                        onClick={() => onUpdateQuantity(item.cartId || item.id || item.name, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-item_remove-button"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => onRemove(item.cartId || item.id || item.name)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <section className="checkout-panel" aria-label="Checkout options">
              <h3 className="checkout-title">Checkout Details</h3>

              <div className="checkout-fieldset" role="group" aria-label="Order type">
                <label>
                  <input
                    type="radio"
                    name="order-type"
                    checked={orderType === 'carryout'}
                    onChange={() => handleOrderTypeChange('carryout')}
                  />
                  Carry-out
                </label>
                <label>
                  <input
                    type="radio"
                    name="order-type"
                    checked={orderType === 'delivery'}
                    onChange={() => handleOrderTypeChange('delivery')}
                  />
                  Delivery
                </label>
              </div>

              {isDelivery && (
                <div className="checkout-section">
                  <h4>Delivery Address</h4>
                  <div className="checkout-grid">
                    <label>
                      Street Address
                      <input
                        type="text"
                        value={deliveryAddress.street1}
                        onChange={(event) => updateDeliveryAddress('street1', event.target.value)}
                      />
                    </label>
                    <label>
                      Apt/Suite (optional)
                      <input
                        type="text"
                        value={deliveryAddress.street2}
                        onChange={(event) => updateDeliveryAddress('street2', event.target.value)}
                      />
                    </label>
                    <label>
                      City
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(event) => updateDeliveryAddress('city', event.target.value)}
                      />
                    </label>
                    <label>
                      State
                      <input
                        type="text"
                        value={deliveryAddress.state}
                        onChange={(event) => updateDeliveryAddress('state', event.target.value)}
                      />
                    </label>
                    <label>
                      ZIP Code
                      <input
                        type="text"
                        inputMode="numeric"
                        value={deliveryAddress.postalCode}
                        onChange={(event) => updateDeliveryAddress('postalCode', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="checkout-section">
                <h4>Tip</h4>
                {isDelivery ? (
                  <>
                    <div className="checkout-tip-buttons" role="group" aria-label="Delivery tip amount">
                      {[10, 15, 20].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          className={tipPercent === percent && !customTipAmount ? 'checkout-tip-selected' : ''}
                          onClick={() => handleTipSelection(percent)}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                    <label>
                      Custom Tip Amount
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customTipAmount}
                        onChange={(event) => setCustomTipAmount(event.target.value)}
                      />
                    </label>
                  </>
                ) : (
                  <p className="checkout-note">No tip suggested for carry-out.</p>
                )}
              </div>

              <div className="checkout-section">
                <h4>Payment</h4>
                <div className="checkout-fieldset" role="group" aria-label="Payment method">
                  <label>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'cash'}
                      disabled={isDelivery}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    Cash
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    Card
                  </label>
                </div>

                {isDelivery && (
                  <p className="checkout-note">Delivery orders require card payment; cash is disabled.</p>
                )}

                {isCardPayment && (
                  <>
                    <label className="checkout-toggle-input">
                      Credit Card Number
                      <div className="checkout-input-with-toggle">
                        <input
                          type={showCardNumber ? 'text' : 'password'}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          value={cardNumber}
                          onChange={(event) => setCardNumber(event.target.value)}
                        />
                        <button type="button" onClick={() => setShowCardNumber((prev) => !prev)}>
                          {showCardNumber ? 'Hide' : 'Unhide'}
                        </button>
                      </div>
                    </label>

                    <label className="checkout-toggle-input">
                      Security Code
                      <div className="checkout-input-with-toggle">
                        <input
                          type={showSecurityCode ? 'text' : 'password'}
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={securityCode}
                          onChange={(event) => setSecurityCode(event.target.value)}
                        />
                        <button type="button" onClick={() => setShowSecurityCode((prev) => !prev)}>
                          {showSecurityCode ? 'Hide' : 'Unhide'}
                        </button>
                      </div>
                    </label>

                    <div className="checkout-grid checkout-grid--two-col">
                      <label>
                        Exp. Month
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp-month"
                          value={expiryMonth}
                          onChange={(event) => setExpiryMonth(event.target.value)}
                        />
                      </label>
                      <label>
                        Exp. Year
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-exp-year"
                          value={expiryYear}
                          onChange={(event) => setExpiryYear(event.target.value)}
                        />
                      </label>
                    </div>

                    <label className="checkout-inline-checkbox">
                      <input
                        type="checkbox"
                        checked={billingSameAsDelivery}
                        onChange={(event) => setBillingSameAsDelivery(event.target.checked)}
                      />
                      Billing is same as delivery address
                    </label>

                    {!billingSameAsDelivery && (
                      <div className="checkout-section">
                        <h4>Billing Address</h4>
                        <div className="checkout-grid">
                          <label>
                            Street Address
                            <input
                              type="text"
                              value={billingAddress.street1}
                              onChange={(event) => updateBillingAddress('street1', event.target.value)}
                            />
                          </label>
                          <label>
                            Apt/Suite (optional)
                            <input
                              type="text"
                              value={billingAddress.street2}
                              onChange={(event) => updateBillingAddress('street2', event.target.value)}
                            />
                          </label>
                          <label>
                            City
                            <input
                              type="text"
                              value={billingAddress.city}
                              onChange={(event) => updateBillingAddress('city', event.target.value)}
                            />
                          </label>
                          <label>
                            State
                            <input
                              type="text"
                              value={billingAddress.state}
                              onChange={(event) => updateBillingAddress('state', event.target.value)}
                            />
                          </label>
                          <label>
                            ZIP Code
                            <input
                              type="text"
                              inputMode="numeric"
                              value={billingAddress.postalCode}
                              onChange={(event) => updateBillingAddress('postalCode', event.target.value)}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="checkout-summary" aria-label="Order summary totals">
                <p><span>Item Subtotal</span> <strong>${subtotal.toFixed(2)}</strong></p>
                <p><span>Taxes</span> <strong>${taxes.toFixed(2)}</strong></p>
                <p><span>Fees</span> <strong>${fees.toFixed(2)}</strong></p>
                <p><span>Tip</span> <strong>${tipAmount.toFixed(2)}</strong></p>
                <p className="checkout-summary_total"><span>Calculated Total</span> <strong>${total.toFixed(2)}</strong></p>
              </div>

              {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
              {checkoutSuccess && <p className="checkout-success" role="status">{checkoutSuccess}</p>}

              <button
                type="button"
                className="checkout-submit-button"
                onClick={handleSubmitOrder}
              >
                Submit Order
              </button>
            </section>
          </>
        )}

        {cartItems.length > 0 && (
          <p className="cart-total"><strong>Current Item Subtotal: ${subtotal.toFixed(2)}</strong></p>
        )}

        {checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}
        {checkoutSuccess && <p className="checkout-success" role="status">{checkoutSuccess}</p>}

        <button type="button" className="cart-close-button" onClick={onClose}>Close</button>
    </ModalShell>
  )
}

export default CartModal
