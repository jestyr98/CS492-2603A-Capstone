import { useEffect, useState } from 'react'

function ProfileModal({
  email,
  name,
  phone,
  onClose,
  onEmailChange,
  onNameChange,
  onPhoneChange,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!isEditing) {
    return (
      <div className="login-modal" id="customer-profile" role="presentation">
        <div
          className="login-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
        >
          <h2 id="profile-modal-title">Customer Profile</h2>

          <div className="profile-info">
            <p><strong>Name:</strong> {name || 'Not set'}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone || 'Not set'}</p>
            <p><strong>Favorite Order:</strong> Pepperoni Pizza</p>
            <p><strong>Rewards Points:</strong> 120</p>
          </div>

          {saveMessage && <p className="login-success" role="status">{saveMessage}</p>}

          <button type="button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>

          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-modal" id="customer-profile" role="presentation">
      <div
        className="login-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-edit-title"
      >
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
      </div>
    </div>
  )
}

export default ProfileModal
