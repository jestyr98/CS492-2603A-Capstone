function CartModal({ cartItems, resolveItemImage, onClose, onRemove, onUpdateQuantity }) {
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return sum + price * item.quantity
  }, 0)

  return (
    <div className="cart-modal">
      <div className="cart-box">
        <h2>Your Cart</h2>

        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
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
                    <button onClick={() => onUpdateQuantity(item.cartId || item.id || item.name, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.cartId || item.id || item.name, item.quantity + 1)}>+</button>
                  </div>

                  <button className="cart-item_remove-button" onClick={() => onRemove(item.cartId || item.id || item.name)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cartItems.length > 0 && (
          <p className="cart-total"><strong>Total: ${total.toFixed(2)}</strong></p>
        )}

        <button className="cart-close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default CartModal
