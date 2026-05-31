import { useState } from 'react'
import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

function ProfileModal({
  email,
  name,
  phone,
  orders = [],
  favoriteOrderId,
  onClose,
  onEmailChange,
  onNameChange,
  onPhoneChange,
  onFavoriteOrderChange,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const favoriteOrder = orders.find((order) => order.orderId === favoriteOrderId)

  const formatOrderTimeUtc = (placedAt) => {
    if (!placedAt) {
      return 'Unknown time'
    }

    const normalizedPlacedAt = (typeof placedAt === 'string' && !/[zZ]|[+-]\d{2}:\d{2}$/.test(placedAt))
      ? `${placedAt.replace(' ', 'T')}Z`
      : placedAt

    const utcDate = new Date(normalizedPlacedAt)
    if (Number.isNaN(utcDate.getTime())) {
      return 'Unknown time'
    }

    return `${utcDate.toLocaleString([], { timeZone: 'UTC' })} UTC`
  }

  const favoriteOrderLabel = favoriteOrder
    ? `${favoriteOrder.items?.map((item) => `${item.name} x${item.quantity}`).join(', ')} | $${Number(favoriteOrder.total || 0).toFixed(2)}`
    : 'Not set'

  useEscapeToClose(onClose)

  if (!isEditing) {
    return (
      <ModalShell overlayId="customer-profile" ariaLabelledBy="profile-modal-title">
          <h2 id="profile-modal-title">Customer Profile</h2>

          <div className="profile-info">
            <p><strong>Name:</strong> {name || 'Not set'}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone || 'Not set'}</p>
            <p><strong>Favorite Order:</strong> {favoriteOrderLabel}</p>
            <p><strong>Rewards Points:</strong> 120</p>
          </div>

          <div className="profile-orders">
            <h3>Past Orders</h3>
            {orders.length === 0 ? (
              <p>No previous orders found.</p>
            ) : (
              <ul>
                {orders.map((order) => (
                  <li key={order.orderId || order.orderNumber}>
                    <div className="profile-order-summary">
                      <strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}
                    </div>
                    <div className="profile-order-summary">
                      <strong>Time:</strong> {formatOrderTimeUtc(order.placedAt)}
                    </div>
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <ul className="profile-order-items">
                        {order.items.map((item, index) => (
                          <li key={`${order.orderNumber}-${item.name}-${index}`}>
                            {item.name} x{item.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      className={`profile-favorite-button ${favoriteOrderId === order.orderId ? 'profile-favorite-button--selected' : ''}`}
                      onClick={() => onFavoriteOrderChange(order.orderId)}
                    >
                      {favoriteOrderId === order.orderId ? 'Favorite Order Selected' : 'Set as Favorite'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {saveMessage && <p className="login-success" role="status">{saveMessage}</p>}

          <div className="profile-actions">
            <button type="button" className="profile-primary-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>

            <button type="button" className="profile-secondary-button" onClick={onClose}>
              Close
            </button>
          </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell overlayId="customer-profile" ariaLabelledBy="profile-edit-title">
        <h2 id="profile-edit-title">Update Profile</h2>

        <label htmlFor="profile-name" className="input-label">Name</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoComplete="name"
          autoFocus
        />

        <label htmlFor="profile-email" className="input-label">Email</label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
        />

        <label htmlFor="profile-phone" className="input-label">Phone Number</label>
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          autoComplete="tel"
        />

        <button
          type="button"
          className="profile-primary-button"
          onClick={() => {
            setIsEditing(false)
            setSaveMessage('Profile updated successfully.')
          }}
        >
          Save Changes
        </button>

        <button type="button" className="profile-secondary-button" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
    </ModalShell>
  )
}

export default ProfileModal
