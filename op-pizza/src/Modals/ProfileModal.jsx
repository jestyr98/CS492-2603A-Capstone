import { useState } from 'react'

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

  if (!isEditing) {
    return (
      <div className="login-modal" id="customer-profile">
        <div className="login-box">
          <h2>Customer Profile</h2>

          <div className="profile-info">
            <p><strong>Name:</strong> {name || 'Not set'}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone || 'Not set'}</p>
            <p><strong>Favorite Order:</strong> Pepperoni Pizza</p>
            <p><strong>Rewards Points:</strong> 120</p>
          </div>

          <button onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>

          <button onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-modal" id="customer-profile">
      <div className="login-box">
        <h2>Update Profile</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />

        <button
          onClick={() => {
            setIsEditing(false)
            alert('Profile updated successfully!')
          }}
        >
          Save Changes
        </button>

        <button onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default ProfileModal
