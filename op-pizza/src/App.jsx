import { useCallback, useEffect, useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import NavMenu from './NavMenu'
import CartIcon from './Cart'
import ProfileModal from './Modals/ProfileModal'
import SignInModal from './Modals/SignInModal'
import CartModal from './Modals/CartModal'
import AdminModal from './Modals/AdminModal'
import CustomizationModal from './Modals/CustomizationModal'

const menuImageModules = import.meta.glob('./assets/*.{jpg,jpeg,png,svg,webp}', {
  eager: true,
  import: 'default',
})

function resolveMenuImage(photoPath) {
  if (!photoPath) {
    return null
  }

  if (photoPath.startsWith('/api/assets/')) {
    return photoPath
  }

  const normalizedPhotoPath = photoPath.replace(/^\.?\/+/, '')
  return menuImageModules[`./assets/${normalizedPhotoPath}`] || `/api/assets/${encodeURIComponent(normalizedPhotoPath)}`
}

function App() {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)

  const [authMode, setAuthMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [showLogin, setShowLogin] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [accountType, setAccountType] = useState('customer')
  const [canAccessAdminMenu, setCanAccessAdminMenu] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [menuSections, setMenuSections] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState('')

  const [adminOptions, setAdminOptions] = useState({ categories: [], ingredientItems: [], categoryIngredients: [], menuItems: [] })
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminAddError, setAdminAddError] = useState('')
  const [adminAddLoading, setAdminAddLoading] = useState(false)
  const [adminRemoveLoading, setAdminRemoveLoading] = useState(false)
  const [adminRemoveId, setAdminRemoveId] = useState('')
  const [adminPhotoFile, setAdminPhotoFile] = useState(null)
  const [adminForm, setAdminForm] = useState({
    categoryId: '',
    itemName: '',
    description: '',
    basePrice: '',
    ingredientIds: [],
  })

  const loadMenu = useCallback(async () => {
    setMenuLoading(true)
    setMenuError('')

    try {
      const response = await fetch('/api/menu')
      if (!response.ok) {
        throw new Error(`Menu request failed with status ${response.status}`)
      }

      const data = await response.json()
      setMenuSections(data.sections || [])
    } catch {
      setMenuError('Unable to load menu right now. Please try again in a moment.')
    } finally {
      setMenuLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMenu()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadMenu])

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const getCartItemKey = (item) => {
    if (item.cartId) {
      return item.cartId
    }

    return `${item.id || item.name}:${item.price || ''}:${item.selectedSize || ''}`
  }

  const hasCustomizationOptions = (item) => {
    return Boolean(item?.options && Object.keys(item.options).length > 0)
  }

  const addToCart = (item) => {
    const itemKey = getCartItemKey(item)

    setCartItems((prev) => {
      const existing = prev.find((i) => getCartItemKey(i) === itemKey)
      if (existing) {
        return prev.map((i) =>
          getCartItemKey(i) === itemKey ? { ...i, quantity: i.quantity + 1 } : i
        )
      }

      return [...prev, { ...item, cartId: itemKey, quantity: 1 }]
    })
  }

  const removeFromCart = (itemKey) => {
    setCartItems((prev) => prev.filter((i) => getCartItemKey(i) !== itemKey))
  }

  const updateQuantity = (itemKey, quantity) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((i) => (getCartItemKey(i) === itemKey ? { ...i, quantity } : i))
    )
  }

  const isMenuOpen = Boolean(menuAnchorEl)
  const primaryMenuSection = menuSections[0]
  const primaryMenuHref = primaryMenuSection ? `#${primaryMenuSection.id}` : '#menu'
  const primaryMenuLabel = primaryMenuSection ? primaryMenuSection.title : 'Menu'

  const openMenu = (event) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuAnchorEl(null)
  }

  const fetchCsrfToken = async () => {
    const csrfResponse = await fetch('/api/csrf-token', {
      credentials: 'include',
    })

    if (!csrfResponse.ok) {
      throw new Error('Unable to initialize secure sign in. Please refresh and try again.')
    }

    const csrfData = await csrfResponse.json()
    return csrfData.csrfToken
  }

  const resetAuthFields = () => {
    setPassword('')
    setConfirmPassword('')
    setLoginError('')
  }

  const loadAdminOptions = useCallback(async () => {
    setAdminLoading(true)
    setAdminError('')

    try {
      const response = await fetch('/api/admin/menu/options', {
        credentials: 'include',
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load admin options right now.')
      }

      setAdminOptions({
        categories: result.categories || [],
        ingredientItems: result.ingredientItems || [],
        categoryIngredients: result.categoryIngredients || [],
        menuItems: result.menuItems || [],
      })
    } catch (error) {
      setAdminError(error.message || 'Unable to load admin options right now.')
    } finally {
      setAdminLoading(false)
    }
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Email and password are required.')
      return
    }

    setAuthLoading(true)
    setLoginError('')

    try {
      const csrfToken = await fetchCsrfToken()
      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to sign in right now.')
      }

      setEmail(result.email || email)
      setName([result.firstName, result.lastName].filter(Boolean).join(' '))
      setPhone(result.phone || '')
      setAccountType(result.accountType || 'customer')
      setCanAccessAdminMenu(Boolean(result.canAccessAdminMenu))
      setIsSignedIn(true)
      setShowLogin(false)
      setAuthMode('signin')
      resetAuthFields()
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !email || !password) {
      setLoginError('First name, last name, email, and password are required.')
      return
    }

    if (password.length < 8) {
      setLoginError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setLoginError('Password and confirmation do not match.')
      return
    }

    setAuthLoading(true)
    setLoginError('')

    try {
      const csrfToken = await fetchCsrfToken()
      const response = await fetch('/api/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          password,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to create account right now.')
      }

      setEmail(result.email || email)
      setName([result.firstName, result.lastName].filter(Boolean).join(' '))
      setPhone(result.phone || '')
      setAccountType(result.accountType || 'customer')
      setCanAccessAdminMenu(Boolean(result.canAccessAdminMenu))
      setIsSignedIn(true)
      setShowLogin(false)
      setAuthMode('signin')
      resetAuthFields()
    } catch (error) {
      setLoginError(error.message || 'Unable to create account right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const csrfToken = await fetchCsrfToken()
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrfToken,
        },
      })
    } catch {
      // Keep client sign-out resilient even when the logout request fails.
    }

    setIsSignedIn(false)
    setAccountType('customer')
    setCanAccessAdminMenu(false)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setPhone('')
    setShowAdmin(false)
    closeMenu()
  }

  const toggleAdminIngredient = (ingredientId) => {
    setAdminForm((prev) => {
      const exists = prev.ingredientIds.includes(ingredientId)
      return {
        ...prev,
        ingredientIds: exists
          ? prev.ingredientIds.filter((id) => id !== ingredientId)
          : [...prev.ingredientIds, ingredientId],
      }
    })
  }

  const handleAdminAddItem = async () => {
    setAdminAddError('')

    if (!adminForm.categoryId || !adminForm.itemName || !adminForm.description || !adminForm.basePrice) {
      setAdminAddError('Category, name, description, and price are required.')
      return
    }

    if (!adminPhotoFile) {
      setAdminAddError('Please upload a photo for the menu item.')
      return
    }

    if (adminForm.ingredientIds.length === 0) {
      setAdminAddError('Select at least one ingredient.')
      return
    }

    setAdminAddLoading(true)
    try {
      const csrfToken = await fetchCsrfToken()
      const uploadPayload = new FormData()
      uploadPayload.append('image', adminPhotoFile)

      const uploadResponse = await fetch('/api/admin/menu-images', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: uploadPayload,
      })

      const uploadResult = await uploadResponse.json()
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Unable to upload image right now.')
      }

      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          categoryId: Number(adminForm.categoryId),
          itemName: adminForm.itemName.trim(),
          description: adminForm.description.trim(),
          photoPath: uploadResult.photoPath,
          basePrice: Number(adminForm.basePrice),
          ingredientIds: adminForm.ingredientIds,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to add menu item right now.')
      }

      await Promise.all([loadAdminOptions(), loadMenu()])
      setAdminForm({
        categoryId: '',
        itemName: '',
        description: '',
        basePrice: '',
        ingredientIds: [],
      })
      setAdminPhotoFile(null)
    } catch (error) {
      setAdminAddError(error.message || 'Unable to add menu item right now.')
    } finally {
      setAdminAddLoading(false)
    }
  }

  const handleAdminRemoveItem = async () => {
    if (!adminRemoveId) {
      return
    }

    setAdminAddError('')
    setAdminRemoveLoading(true)
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await fetch(`/api/admin/menu-items/${adminRemoveId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrfToken,
        },
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to remove menu item right now.')
      }

      setAdminRemoveId('')
      await Promise.all([loadAdminOptions(), loadMenu()])
    } catch (error) {
      setAdminAddError(error.message || 'Unable to remove menu item right now.')
    } finally {
      setAdminRemoveLoading(false)
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="header" id="home">
        <div className="header_content container">
          <a href="#home" className="brand" onClick={closeMenu}>
            <img src={logo} alt="Operation Pizzeria logo" className="header-logo" />
            <h1 className="header-name">Operation Pizzeria</h1>
          </a>
          
          <nav className="header_nav">
            <a href={primaryMenuHref} className="header_link" onClick={closeMenu}>{primaryMenuLabel}</a>
            <a href="#contact" className="header_link" onClick={closeMenu}>Contact</a>
            <a 
              href="#signin"
              className="header_link"
              onClick={(event) => {
                event.preventDefault()
                closeMenu()
                setAuthMode('signin')
                setLoginError('')
                setShowLogin(true)
              }}
            >
                {isSignedIn ? email : 'Sign In/Create Account'}
          </a>

            <CartIcon itemCount={cartItemCount} onClick={() => setShowCart(true)} />

            <NavMenu
              isMenuOpen={isMenuOpen}
              menuAnchorEl={menuAnchorEl}
              menuSections={menuSections}
              isSignedIn={isSignedIn}
              accountType={accountType}
              canAccessAdminMenu={canAccessAdminMenu}
              onOpen={openMenu}
              onClose={closeMenu}
              onViewProfile={() => { setShowProfile(true); closeMenu(); }}
              onOpenAdmin={() => {
                if (!canAccessAdminMenu) {
                  return
                }
                setShowAdmin(true)
                setAdminAddError('')
                loadAdminOptions()
                closeMenu()
              }}
              onSignOut={handleSignOut}
            />
          </nav>
        </div>
      </header>

      <main className="main-content" id="main-content" tabIndex="-1">

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

          <nav className="menu_quick-links" aria-label="Menu section shortcuts">
            {menuSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="menu_quick-link">
                {section.title}
              </a>
            ))}
          </nav>

          {menuLoading && <p role="status">Loading menu...</p>}
          {!menuLoading && menuError && <p role="alert">{menuError}</p>}

          {!menuLoading && !menuError && menuSections.map((section) => (
            <section key={section.id} id={section.id} className="menu-section">
              <h3>{section.title}</h3>
              <div className="menu-grid">
                {section.items.map((item) => (
                  <article className="menu-card" key={item.id || item.name}>
                    <img src={resolveMenuImage(item.photoPath) || logo} alt={`${item.name} menu item`} className="menu-card_image" />
                    <div className="menu-card_content">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <p className="menu-card_price">{item.price}</p>
                      {hasCustomizationOptions(item) ? (
                        <button
                          type="button"
                          aria-label={`Customize ${item.name}`}
                          onClick={() => setSelectedItem(item)}
                        >
                          Customize
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Add ${item.name} to cart`}
                          onClick={() => addToCart(item)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>





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
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Visit our Facebook page"><FacebookIcon aria-hidden="true" /></a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Visit our X page"><XIcon aria-hidden="true" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Visit our Instagram page"><InstagramIcon aria-hidden="true" /></a>
            </div>
          </article>
        </section>

      </main>
      {showLogin && (
        <SignInModal
          authMode={authMode}
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          confirmPassword={confirmPassword}
          email={email}
          password={password}
          loginError={loginError}
          authLoading={authLoading}
          onAuthModeChange={(mode) => {
            setAuthMode(mode)
            setLoginError('')
          }}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          onConfirmPasswordChange={setConfirmPassword}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={handleLogin}
          onCreateAccount={handleCreateAccount}
          onForgotPassword={() => alert('Password reset link sent to your email.')}
          onClose={() => {
            setShowLogin(false)
            setAuthMode('signin')
            resetAuthFields()
          }}
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

      {showAdmin && (
        <AdminModal
          options={adminOptions}
          loading={adminLoading}
          error={adminError}
          addForm={adminForm}
          addError={adminAddError}
          addLoading={adminAddLoading}
          removeId={adminRemoveId}
          removeLoading={adminRemoveLoading}
          onFormChange={(field, value) => {
            setAdminForm((prev) => ({ ...prev, [field]: value }))
          }}
          onPhotoSelected={setAdminPhotoFile}
          onToggleIngredient={toggleAdminIngredient}
          onRemoveSelection={setAdminRemoveId}
          onSubmitAdd={handleAdminAddItem}
          onSubmitRemove={handleAdminRemoveItem}
          onReload={loadAdminOptions}
          selectedPhotoName={adminPhotoFile?.name || ''}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {selectedItem && (
        <CustomizationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(customizedItem) => {
            addToCart(customizedItem)
            setSelectedItem(null)
          }}
        />
      )}

      {showCart && (
        <CartModal
          cartItems={cartItems}
          resolveItemImage={resolveMenuImage}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  )
}

export default App
