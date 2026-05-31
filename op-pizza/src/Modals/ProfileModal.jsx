import { useState } from 'react'
import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

function ProfileModal({
  email,
  name,
  phone,
  orders = [],
  onClose,
  onEmailChange,
  onNameChange,
  onPhoneChange,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEscapeToClose(onClose)

  if (!isEditing) {
    return (
      <ModalShell overlayId="customer-profile" ariaLabelledBy="profile-modal-title">
          <h2 id="profile-modal-title">Customer Profile</h2>

          <div className="profile-info">
            <p><strong>Name:</strong> {name || 'Not set'}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone || 'Not set'}</p>
            <p><strong>Favorite Order:</strong> Pepperoni Pizza</p>
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
                    <strong>{order.orderNumber}</strong> - ${Number(order.total || 0).toFixed(2)} - {order.status}
                    <div>
                      Ordered: {order.placedAt ? new Date(order.placedAt).toLocaleString() : 'Unknown date'}
                    </div>
                    {Array.isArray(order.items) && order.items.length > 0 && (
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={`${order.orderNumber}-${item.name}-${index}`}>
                            {item.name} x{item.quantity} (${Number(item.line_total || 0).toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {saveMessage && <p className="login-success" role="status">{saveMessage}</p>}

          <button type="button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>

          <button type="button" onClick={onClose}>
            Close
          </button>
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
          onClick={() => {
            setIsEditing(false)
            setSaveMessage('Profile updated successfully.')
          }}
        >
          Save Changes
        </button>

        <button type="button" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
    </ModalShell>
  )
}

export default ProfileModal
