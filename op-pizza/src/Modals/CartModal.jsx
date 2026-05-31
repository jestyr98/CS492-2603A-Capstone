import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

function CartModal({ cartItems, resolveItemImage, onClose, onRemove, onUpdateQuantity }) {
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, ''))
    return sum + price * item.quantity
  }, 0)

  useEscapeToClose(onClose)

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
        )}

        {cartItems.length > 0 && (
          <p className="cart-total"><strong>Total: ${total.toFixed(2)}</strong></p>
        )}

        <button type="button" className="cart-close-button" onClick={onClose}>Close</button>
    </ModalShell>
  )
}

export default CartModal
