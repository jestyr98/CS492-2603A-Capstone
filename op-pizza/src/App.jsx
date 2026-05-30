import { useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import storeFront from './assets/pizza-restaurant-exterior.jpg'
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import NavMenu from './NavMenu'
import CartIcon from './Cart'
import menuSections from './Menu/MenuSection'
import ProfileModal from './Modals/ProfileModal'
import SignInModal from './Modals/SignInModal'
import CartModal from './Modals/CartModal'

function App() {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [showLogin, setShowLogin] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.name === item.name)
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (name) => {
    setCartItems((prev) => prev.filter((i) => i.name !== name))
  }

  const updateQuantity = (name, quantity) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity } : i))
    )
  }

  const isMenuOpen = Boolean(menuAnchorEl)

  const openMenu = (event) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuAnchorEl(null)
  }

  return (
    <>
      <header className="header" id="home">
        <div className="header_content container">
          <a href="#home" className="brand" onClick={closeMenu}>
            <img src={logo} alt="Operation Pizzeria logo" className="header-logo" />
            <h1 className="header-name">Operation Pizzeria</h1>
          </a>
          
          <nav className="header_nav">
            <a href="#specials" className="header_link" onClick={closeMenu}>Specials</a>
            <a href="#contact" className="header_link" onClick={closeMenu}>Contact</a>
            <a
              href="#signin"
              className="header_link"
              onClick={(event) => {
                event.preventDefault()
                closeMenu()
                setShowLogin(true)
              }}
            >
                {isSignedIn ? email : 'Sign In'}
          </a>

            <CartIcon itemCount={cartItemCount} onClick={() => setShowCart(true)} />

            <NavMenu
              isMenuOpen={isMenuOpen}
              menuAnchorEl={menuAnchorEl}
              isSignedIn={isSignedIn}
              onOpen={openMenu}
              onClose={closeMenu}
              onViewProfile={() => { setShowProfile(true); closeMenu(); }}
              onSignOut={() => { setIsSignedIn(false); setEmail(''); setPassword(''); setName(''); setPhone(''); closeMenu(); }}
            />
          </nav>
        </div>
      </header>

      <main className="main-content">

        <section className="hero container">
          <article className="hero-card">
            <h2>Mission Statement</h2>
            <p>
              We serve handcrafted pizza with hometown hospitality, bringing families together with
              bold flavor and quick service.
            </p>
          </article>
        </section>

        <section id="menu" className="menu container">
          <div className="menu_header">
            <h2>Our Menu</h2>
            <p>
              Explore sections and jump to your favorites. Each item includes a photo, description,
              and price.
            </p>
          </div>

          <div className="menu_quick-links" aria-label="Menu section shortcuts">
            {menuSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="menu_quick-link">
                {section.title}
              </a>
            ))}
          </div>

          {menuSections.map((section) => (
            <section key={section.id} id={section.id} className="menu-section">
              <h3>{section.title}</h3>
              <div className="menu-grid">
                {section.items.map((item) => (
                  <article className="menu-card" key={item.name}>
                    <img src={item.photo} alt={`${item.name} menu item`} className="menu-card_image" />
                    <div className="menu-card_content">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <p className="menu-card_price">{item.price}</p>
                      <button onClick={() => addToCart(item)}>Add to Cart</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>





        <section className="hero-primary container" id="contact">
          <article className="hero-card hero-card--contact">
            <img className="menu-card_image" src={storeFront}/>
            <h2>Contact & Hours</h2>
            <p>1408 Pepper Street, Columbia, SC 29201</p>
            <p>
              Phone: <a href="tel:+18035551234">(803) 555-1234</a>
            </p>
            <p>
              Email: <a href="mailto:hello@operationpizzeria.com">hello@operationpizzeria.com</a>
            </p>
            <p>Mon-Thu: 11:00 AM - 9:00 PM | Fri-Sat: 11:00 AM - 11:00 PM | Sun: 12:00 PM - 8:00 PM</p>

            <div className="social-links" aria-label="Social media links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><FacebookIcon /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer"><XIcon /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><InstagramIcon /></a>
            </div>
          </article>
        </section>

      </main>
      {showLogin && (
        <SignInModal
          email={email}
          password={password}
          loginError={loginError}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={() => {
            if (email === 'customer@example.com' && password === 'pizza123') {
              setIsSignedIn(true)
              setShowLogin(false)
              setLoginError('')

              setTimeout(() => {
                document
                  .getElementById('customer-profile')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            } else {
              setLoginError('Invalid email or password.')
            }
          }}
          onForgotPassword={() => alert('Password reset link sent to your email.')}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showProfile && (
        <ProfileModal
          email={email}
          name={name}
          phone={phone}
          onClose={() => setShowProfile(false)}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPhoneChange={setPhone}
        />
      )}

      {showCart && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  )
}

export default App
