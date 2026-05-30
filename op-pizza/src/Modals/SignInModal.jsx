function SignInModal({
  email,
  password,
  loginError,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
  onClose,
}) {
  return (
    <div className="login-modal">
      <div className="login-box">
        <h2>Sign In</h2>

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

        {loginError && <p className="login-error">{loginError}</p>}

        <button onClick={onLogin}>
          Login
        </button>

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

        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default SignInModal
