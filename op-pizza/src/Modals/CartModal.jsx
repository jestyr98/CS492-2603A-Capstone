function CartModal({ cartItems, onClose, onRemove, onUpdateQuantity }) {
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="login-modal">
      <div className="login-box">
        <h2>Your Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.cartId || item.name} className="cart-item">
                <span className="cart-item_name">{item.name}</span>
                <span className="cart-item_price">{item.price}</span>

                <div className="cart-item_details">
                  {item.selectedSize && <p>Size: {item.selectedSize}</p>}

                  {item.removedToppings?.length > 0 && (
                    <p>Removed: {item.removedToppings.join(', ')}</p>
                  )}

                  {item.selectedExtras?.length > 0 && (
                    <p>
                      Extras:{' '}
                      {item.selectedExtras.map((extra) => extra.name).join(', ')}
                    </p>
                  )}

                  {item.selectedSauceOne && <p>Sauce 1: {item.selectedSauceOne}</p>}
                  {item.selectedSauceTwo && <p>Sauce 2: {item.selectedSauceTwo}</p>}
                  {item.selectedDip && <p>Dip: {item.selectedDip}</p>}

                  {item.extraDips &&
                    Object.values(item.extraDips).some((dip) => dip.quantity > 0) && (
                      <p>
                        Extra Dips:{' '}
                        {Object.values(item.extraDips)
                          .filter((dip) => dip.quantity > 0)
                          .map((dip) => `${dip.name} x${dip.quantity}`)
                          .join(', ')}
                      </p>
                    )}
                </div>

                <div className="cart-item_qty">
                  <button onClick={() => onUpdateQuantity(item.cartId || item.name, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.cartId || item.name, item.quantity + 1)}>+</button>
                </div>

                <button onClick={() => onRemove(item.cartId || item.name)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        {cartItems.length > 0 && (
          <p className="cart-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </p>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default CartModal