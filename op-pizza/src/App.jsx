import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import storeFront from './assets/pizza-restaurant-exterior.jpg'
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
import { fetchWithCsrf } from './lib/api'

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
  const [showMapView, setShowMapView] = useState(false)
  const [showSpecials, setShowSpecials] = useState(false)

  const [authMode, setAuthMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mfaMethod, setMfaMethod] = useState('email')
  const [resetToken, setResetToken] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
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
  const [profileOrders, setProfileOrders] = useState([])
  const [favoriteOrderId, setFavoriteOrderId] = useState(null)
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
  const [adminEditLoading, setAdminEditLoading] = useState(false)
  const [adminEditForm, setAdminEditForm] = useState({
    menuItemId: '',
    itemName: '',
    description: '',
    basePrice: '',
  })
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

  const persistedFavoriteOrderId = useMemo(() => {
    if (!email) {
      return null
    }

    const savedFavoriteOrderId = window.localStorage.getItem(`opPizzaFavoriteOrder:${email.toLowerCase()}`)
    return savedFavoriteOrderId ? Number(savedFavoriteOrderId) : null
  }, [email])

  const selectedFavoriteOrderId = favoriteOrderId ?? persistedFavoriteOrderId
  const effectiveFavoriteOrderId = profileOrders.some((order) => order.orderId === selectedFavoriteOrderId)
    ? selectedFavoriteOrderId
    : null

  const handleFavoriteOrderChange = (orderId) => {
    const normalizedOrderId = Number(orderId)
    const nextFavoriteOrderId = Number.isFinite(normalizedOrderId) ? normalizedOrderId : null
    setFavoriteOrderId(nextFavoriteOrderId)

    if (!email) {
      return
    }

    const storageKey = `opPizzaFavoriteOrder:${email.toLowerCase()}`
    if (nextFavoriteOrderId) {
      window.localStorage.setItem(storageKey, String(nextFavoriteOrderId))
    } else {
      window.localStorage.removeItem(storageKey)
    }
  }

  const loadOrderHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/orders/history', {
        credentials: 'include',
      })

      if (!response.ok) {
        setProfileOrders([])
        return
      }

      const result = await response.json()
      setProfileOrders(result.orders || [])
    } catch {
      setProfileOrders([])
    }
  }, [])

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const getMenuItemCartQuantity = (menuItemId) => {
    return cartItems
      .filter((cartItem) => cartItem.id === menuItemId)
      .reduce((sum, cartItem) => sum + cartItem.quantity, 0)
  }

  const popularItems = menuSections
    .flatMap((section) => section.items || [])
    .filter((item) => Boolean(item.photoPath))
    .slice(0, 3)

  const specialsSection = menuSections.find(
    (section) => /special/i.test(section.title || '') || /special/i.test(section.id || '')
  )

  const nonSpecialMenuSections = menuSections.filter(
    (section) => !(/special/i.test(section.title || '') || /special/i.test(section.id || ''))
  )

  const specialsBannerItems = (specialsSection?.items?.length ? specialsSection.items : popularItems)
    .filter((item) => Boolean(item.photoPath))
    .slice(0, 3)

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

  const removeMenuItemFromCart = (menuItemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== menuItemId))
  }

  const updateQuantity = (itemKey, quantity) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((i) => (getCartItemKey(i) === itemKey ? { ...i, quantity } : i))
    )
  }

  const submitOrder = async (checkoutPayload) => {
    const paymentMethod = checkoutPayload.paymentMethod
    let paymentStatus = 'not_required'
    let paymentId

    if (paymentMethod === 'card') {
      const card = checkoutPayload.paymentCard
      const tokenizeResponse = await fetchWithCsrf('/api/payments/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card }),
      })

      const tokenizeResult = await tokenizeResponse.json()
      if (!tokenizeResponse.ok) {
        throw new Error(tokenizeResult.error || 'Unable to tokenize payment card.')
      }

      const merchantReference = `ORDER-${Date.now()}`
      let attemptCount = 0
      let charged = false
      let lastChargeError = null

      while (!charged && attemptCount < 5) {
        attemptCount += 1

        const chargeResponse = await fetchWithCsrf('/api/payments/charge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': `${merchantReference}-${attemptCount}`,
          },
          body: JSON.stringify({
            token: tokenizeResult.token,
            amount: checkoutPayload.pricing.total,
            currency: 'USD',
            merchantReference,
          }),
        })

        const chargeResult = await chargeResponse.json()
        if (chargeResponse.ok) {
          charged = true
          paymentStatus = chargeResult.status
          paymentId = chargeResult.paymentId
          break
        }

        lastChargeError = chargeResult
        if (chargeResult.code !== 'network_error') {
          throw new Error(chargeResult.error || 'Payment failed.')
        }
      }

      if (!charged) {
        throw new Error(lastChargeError?.error || 'Payment failed due to repeated network errors after 5 retries.')
      }
    }

    const orderResponse = await fetchWithCsrf('/api/orders/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...checkoutPayload,
        paymentStatus,
        ...(paymentId ? { paymentId } : {}),
      }),
    })

    const orderResult = await orderResponse.json()
    if (!orderResponse.ok) {
      throw new Error(orderResult.error || 'Unable to submit order right now.')
    }

    setCartItems([])
    loadOrderHistory()

    return {
      message: paymentMethod === 'card'
        ? `Payment successful. Your order was submitted.\nOrder Number: ${orderResult.orderNumber}\nTotal: $${Number(checkoutPayload?.pricing?.total || 0).toFixed(2)}`
        : `Order submitted successfully.\nOrder Number: ${orderResult.orderNumber}\nTotal: $${Number(checkoutPayload?.pricing?.total || 0).toFixed(2)}`,
      orderNumber: orderResult.orderNumber,
    }
  }

  const isMenuOpen = Boolean(menuAnchorEl)
  const openMenu = (event) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setMenuAnchorEl(null)
  }

  const resetAuthFields = () => {
    setPassword('')
    setConfirmPassword('')
    setResetToken('')
    setMfaMethod('email')
    setLoginSuccess('')
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
    setLoginSuccess('')

    try {
      const response = await fetchWithCsrf('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      setFavoriteOrderId(null)
      loadOrderHistory()
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
    setLoginSuccess('')

    try {
      const response = await fetchWithCsrf('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          mfaMethod,
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
      setFavoriteOrderId(null)
      loadOrderHistory()
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
      await fetchWithCsrf('/api/logout', {
        method: 'POST',
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
    setProfileOrders([])
    setFavoriteOrderId(null)
    setShowAdmin(false)
    closeMenu()
  }

  const handleRequestPasswordReset = async () => {
    if (!email) {
      setLoginError('Enter your email address first.')
      return
    }

    setAuthLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const response = await fetchWithCsrf('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to request password reset right now.')
      }

      if (result.resetToken) {
        setResetToken(result.resetToken)
      }
      setLoginSuccess('Reset token generated. Use it to set a new password.')
      setAuthMode('forgot')
    } catch (error) {
      setLoginError(error.message || 'Unable to request password reset right now.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email || !resetToken || !password) {
      setLoginError('Email, reset token, and new password are required.')
      return
    }

    if (password.length < 8) {
      setLoginError('Password must be at least 8 characters long.')
      return
    }

    setAuthLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const response = await fetchWithCsrf('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          password,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to reset password right now.')
      }

      setLoginSuccess('Password reset successful. You can now sign in.')
      setAuthMode('signin')
      setResetToken('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setLoginError(error.message || 'Unable to reset password right now.')
    } finally {
      setAuthLoading(false)
    }
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
      const uploadPayload = new FormData()
      uploadPayload.append('image', adminPhotoFile)

      const uploadResponse = await fetchWithCsrf('/api/admin/menu-images', {
        method: 'POST',
        body: uploadPayload,
      })

      const uploadResult = await uploadResponse.json()
      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Unable to upload image right now.')
      }

      const response = await fetchWithCsrf('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetchWithCsrf(`/api/admin/menu-items/${adminRemoveId}`, {
        method: 'DELETE',
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

  const handleAdminEditItem = async () => {
    setAdminAddError('')

    if (!adminEditForm.menuItemId) {
      setAdminAddError('Select a menu item to edit.')
      return
    }

    const payload = {}
    if (adminEditForm.itemName.trim()) {
      payload.itemName = adminEditForm.itemName.trim()
    }
    if (adminEditForm.description.trim()) {
      payload.description = adminEditForm.description.trim()
    }
    if (adminEditForm.basePrice !== '') {
      payload.basePrice = Number(adminEditForm.basePrice)
    }

    if (Object.keys(payload).length === 0) {
      setAdminAddError('Provide at least one field to update for the selected item.')
      return
    }

    setAdminEditLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/admin/menu-items/${adminEditForm.menuItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Unable to update menu item right now.')
      }

      setAdminEditForm({
        menuItemId: '',
        itemName: '',
        description: '',
        basePrice: '',
      })

      await Promise.all([loadAdminOptions(), loadMenu()])
    } catch (error) {
      setAdminAddError(error.message || 'Unable to update menu item right now.')
    } finally {
      setAdminEditLoading(false)
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
            <button
              type="button"
              className="header_link header_link-button"
              aria-label={showSpecials ? 'Hide specials banner' : 'Show specials banner'}
              onClick={() => {
                setShowSpecials((prev) => !prev)
                closeMenu()
              }}
            >
              Specials
            </button>
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
              onViewProfile={() => {
                loadOrderHistory()
                setShowProfile(true)
                closeMenu()
              }}
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

        {showSpecials && specialsBannerItems.length > 0 && (
          <div className="header_popular container" aria-label="Special menu items">
            {specialsBannerItems.map((item) => (
              <article key={`popular-${item.id || item.name}`} className="header_popular-item">
                <img
                  src={resolveMenuImage(item.photoPath) || logo}
                  alt={`Special item ${item.name}`}
                  className="header_popular-image"
                />
                <span>{item.name}</span>
                <div className="header_popular-actions">
                  {hasCustomizationOptions(item) && (
                    <button
                      type="button"
                      className="header_popular-customize"
                      aria-label={`Customize ${item.name}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      Customize
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
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
            {nonSpecialMenuSections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="menu_quick-link">
                {section.title}
              </a>
            ))}
          </nav>

          {menuLoading && <p role="status">Loading menu...</p>}
          {!menuLoading && menuError && <p role="alert">{menuError}</p>}

          {!menuLoading && !menuError && nonSpecialMenuSections.map((section) => (
            <section key={section.id} id={section.id} className="menu-section">
              <h3>{section.title}</h3>
              <div className="menu-grid">
                {section.items.map((item) => {
                  const itemCartQuantity = getMenuItemCartQuantity(item.id)
                  const itemHasCustomization = hasCustomizationOptions(item)

                  return (
                  <article className="menu-card" key={item.id || item.name}>
                    <img src={resolveMenuImage(item.photoPath) || logo} alt={`${item.name} menu item`} className="menu-card_image" />
                    <div className="menu-card_content">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <p className="menu-card_price">{item.price}</p>
                      {itemCartQuantity > 0 && (
                        <p className="menu-item_in-cart">In cart: {itemCartQuantity}</p>
                      )}
                      {itemHasCustomization ? (
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
                      {itemCartQuantity > 0 && (
                        <button
                          type="button"
                          className="menu-remove-button"
                          aria-label={`Remove ${item.name} from cart`}
                          onClick={() => removeMenuItemFromCart(item.id)}
                        >
                          Remove from Cart
                        </button>
                      )}
                    </div>
                  </article>
                )})}
              </div>
            </section>
          ))}
        </section>





        <section className="hero-primary container" id="contact">
          <article className="hero-card hero-card--contact">
            {!showMapView ? (
              <img className="menu-card_image" src={storeFront} alt="Operation Pizzeria storefront" />
            ) : (
              <iframe
                className="contact-map"
                title="Operation Pizzeria map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-81.056%2C33.985%2C-80.961%2C34.045&layer=mapnik&marker=34.015%2C-81.008"
              />
            )}
            <button
              type="button"
              className="link-button"
              onClick={() => setShowMapView((prev) => !prev)}
            >
              {showMapView ? 'Show Road View Photo' : 'Show City Map + Delivery Radius'}
            </button>
            {showMapView && <p className="checkout-note">Delivery radius view: approximately 5 miles from store location.</p>}
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
          mfaMethod={mfaMethod}
          resetToken={resetToken}
          email={email}
          password={password}
          loginError={loginError}
          loginSuccess={loginSuccess}
          authLoading={authLoading}
          onAuthModeChange={(mode) => {
            setAuthMode(mode)
            setLoginError('')
            setLoginSuccess('')
          }}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onPhoneChange={setPhone}
          onConfirmPasswordChange={setConfirmPassword}
          onMfaMethodChange={setMfaMethod}
          onResetTokenChange={setResetToken}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={handleLogin}
          onCreateAccount={handleCreateAccount}
          onForgotPassword={handleRequestPasswordReset}
          onResetPassword={handleResetPassword}
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
          orders={profileOrders}
          favoriteOrderId={effectiveFavoriteOrderId}
          onClose={() => setShowProfile(false)}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onFavoriteOrderChange={handleFavoriteOrderChange}
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
          editForm={adminEditForm}
          editLoading={adminEditLoading}
          removeId={adminRemoveId}
          removeLoading={adminRemoveLoading}
          onFormChange={(field, value) => {
            setAdminForm((prev) => ({ ...prev, [field]: value }))
          }}
          onPhotoSelected={setAdminPhotoFile}
          onToggleIngredient={toggleAdminIngredient}
          onEditFormChange={(field, value) => {
            setAdminEditForm((prev) => ({ ...prev, [field]: value }))
          }}
          onRemoveSelection={setAdminRemoveId}
          onSubmitAdd={handleAdminAddItem}
          onSubmitEdit={handleAdminEditItem}
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
          onSubmitOrder={submitOrder}
        />
      )}
    </>
  )
}

export default App
