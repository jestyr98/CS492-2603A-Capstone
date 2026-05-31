import useEscapeToClose from '../hooks/useEscapeToClose'
import ModalShell from './components/ModalShell'

function SignInModal({
  authMode,
  firstName,
  lastName,
  phone,
  confirmPassword,
  email,
  password,
  loginError,
  authLoading,
  onAuthModeChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onConfirmPasswordChange,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onCreateAccount,
  onForgotPassword,
  onClose,
}) {
  const isCreateMode = authMode === 'create'

  useEscapeToClose(onClose)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isCreateMode) {
      onCreateAccount()
      return
    }
    onLogin()
  }

  return (
    <ModalShell ariaLabelledBy="auth-modal-title">
        <h2 id="auth-modal-title">{isCreateMode ? 'Create Account' : 'Sign In'}</h2>

        <form onSubmit={handleSubmit} className="modal-form">

        {isCreateMode && (
          <>
            <label htmlFor="auth-first-name" className="input-label">First Name</label>
            <input
              id="auth-first-name"
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              autoComplete="given-name"
            />

            <label htmlFor="auth-last-name" className="input-label">Last Name</label>
            <input
              id="auth-last-name"
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              autoComplete="family-name"
            />

            <label htmlFor="auth-phone" className="input-label">Phone (optional)</label>
            <input
              id="auth-phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              autoComplete="tel"
            />
          </>
        )}

        <label htmlFor="auth-email" className="input-label">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
          autoFocus={!isCreateMode}
        />

        <label htmlFor="auth-password" className="input-label">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete={isCreateMode ? 'new-password' : 'current-password'}
        />

        {isCreateMode && (
          <>
            <label htmlFor="auth-confirm-password" className="input-label">Confirm Password</label>
            <input
              id="auth-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              autoComplete="new-password"
            />
          </>
        )}

        {loginError && <p className="login-error" role="alert">{loginError}</p>}

        <button className="login-button" type="submit" disabled={authLoading}>
          {authLoading ? 'Please wait...' : (isCreateMode ? 'Create Account' : 'Login')}
        </button>

        {!isCreateMode && (
          <button
            type="button"
            className="link-button"
            onClick={(e) => {
              e.preventDefault()
              onForgotPassword()
            }}
          >
            Forgot Password?
          </button>
        )}

        <button
          type="button"
          className="link-button"
          onClick={(e) => {
            e.preventDefault()
            onAuthModeChange(isCreateMode ? 'signin' : 'create')
          }}
        >
          {isCreateMode ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>

        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
        </form>
    </ModalShell>
  )
}

export default SignInModal
