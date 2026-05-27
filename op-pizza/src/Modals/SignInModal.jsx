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

  return (
    <div className="login-modal">
      <div className="login-box">
        <h2>{isCreateMode ? 'Create Account' : 'Sign In'}</h2>

        {isCreateMode && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
            />

            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />

        {isCreateMode && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
          />
        )}

        {loginError && <p className="login-error">{loginError}</p>}

        <button onClick={isCreateMode ? onCreateAccount : onLogin} disabled={authLoading}>
          {authLoading ? 'Please wait...' : (isCreateMode ? 'Create Account' : 'Login')}
        </button>

        {!isCreateMode && (
          <a
            href="#forgot-password"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault()
              onForgotPassword()
            }}
          >
            Forgot Password?
          </a>
        )}

        <a
          href="#toggle-auth-mode"
          className="forgot-password"
          onClick={(e) => {
            e.preventDefault()
            onAuthModeChange(isCreateMode ? 'signin' : 'create')
          }}
        >
          {isCreateMode ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </a>

        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default SignInModal
