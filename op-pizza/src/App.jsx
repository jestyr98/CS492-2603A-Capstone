import { useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import menuSections from './Menu/MenuSection'

function App() {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [showLogin, setShowLogin] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

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
                {isSignedIn ? 'Signed In' : 'Sign In'}
          </a>

            <IconButton
              id="category-menu-button"
              className="menu-toggle"
              aria-label="Toggle menu categories"
              aria-controls={isMenuOpen ? 'category-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={openMenu}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="category-menu"
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={closeMenu}
              MenuListProps={{
                'aria-labelledby': 'category-menu-button',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem component="a" href="#specials" onClick={closeMenu}>Specials</MenuItem>
              <MenuItem component="a" href="#pizzas" onClick={closeMenu}>Pizzas</MenuItem>
              <MenuItem component="a" href="#salads" onClick={closeMenu}>Salads</MenuItem>
              <MenuItem component="a" href="#wings" onClick={closeMenu}>Wings</MenuItem>
              <MenuItem component="a" href="#beverages" onClick={closeMenu}>Beverages</MenuItem>
              <MenuItem component="a" href="#desserts" onClick={closeMenu}>Desserts</MenuItem>
            </Menu>
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
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>

        {isSignedIn && (
          <section id="customer-profile" className="customer-profile container">
            <article className="hero-card">
              <h2>Customer Profile</h2>
              <p>Welcome back! Manage your account details below.</p>

              <div className="profile-info">
                <p><strong>Name:</strong> Guest Customer</p>
                <p><strong>Email:</strong> customer@example.com</p>
                <p><strong>Favorite Order:</strong> Pepperoni Pizza</p>
                <p><strong>Rewards Points:</strong> 120</p>
              </div>
            </article>
          </section>
        )}



        <section className="hero-primary container" id="contact">
          <article className="hero-card hero-card--contact">
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
        <div className="login-modal">
          <div className="login-box">
            <h2>Sign In</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              />

          {loginError && <p className="login-error">{loginError}</p>}

            <button
              onClick={() => {
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
          > 
            Login
          </button>

            <a
              href="#forgot-password"
              className="forgot-password"
              onClick={(e) => {
                e.preventDefault()
                alert('Password reset link sent to your email.')
              }}
            >
              Forgot Password?
            </a>

            <button onClick={() => setShowLogin(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
