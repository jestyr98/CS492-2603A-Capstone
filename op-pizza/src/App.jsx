import { useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const menuSections = [
  {
    id: 'salads',
    title: 'Salads',
    items: [
      {
        name: 'Garden House Salad',
        description: 'Crisp romaine, cherry tomatoes, cucumbers, and parmesan with herb vinaigrette.',
        price: '$8.99',
        photo:
          'placeholder',
      },
      {
        name: 'Chicken Caesar',
        description: 'Grilled chicken, shaved parmesan, garlic croutons, and classic Caesar dressing.',
        price: '$10.99',
        photo:
          'placeholder',
      },
    ],
  },
  {
    id: 'pizzas',
    title: 'Pizzas',
    items: [
      {
        name: 'Operation Supreme',
        description: 'Pepperoni, sausage, bell peppers, mushrooms, onions, and mozzarella.',
        price: '$16.99',
        photo:
          'placeholder',
      },
      {
        name: 'Margherita Classic',
        description: 'Fresh basil, tomato sauce, roasted tomatoes, and mozzarella on hand-tossed dough.',
        price: '$14.49',
        photo:
          'placeholder',
      },
    ],
  },
  {
    id: 'wings',
    title: 'Wings',
    items: [
      {
        name: 'Buffalo Wings',
        description: 'Ten crispy wings tossed in classic buffalo sauce with ranch dip.',
        price: '$12.99',
        photo:
          'placeholder',
      },
      {
        name: 'Honey Garlic Wings',
        description: 'Sweet and savory glaze on bone-in wings with celery and house dip.',
        price: '$13.49',
        photo:
          'placeholder',
      },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    items: [
      {
        name: 'Cinnamon Bread Bites',
        description: 'Warm baked bites glazed with cinnamon sugar and vanilla icing.',
        price: '$6.99',
        photo:
          'placeholder',
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Rich chocolate cake with a molten center and powdered sugar finish.',
        price: '$7.49',
        photo:
          'placeholder',
      },
    ],
  },
  {
    id: 'beverages',
    title: 'Beverages',
    items: [
      {
        name: 'Sparkling Citrus Soda',
        description: 'Refreshing lemon-lime soda served chilled in a 20oz bottle.',
        price: '$2.99',
        photo:
          'placeholder',
      },
      {
        name: 'Sweet Tea',
        description: 'Fresh brewed sweet tea with lemon over ice.',
        price: '$2.49',
        photo:
          'placeholder',
      },
    ],
  },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="header" id="home">
        <div className="header_content container">
          <a href="#home" className="brand" onClick={closeMenu}>
            <img src={logo} alt="Operation Pizzeria logo" className="header-logo" />
            <h1 className="header-name">Operation Pizzeria</h1>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-toggle_bar" />
            <span className="menu-toggle_bar" />
            <span className="menu-toggle_bar" />
          </button>

          <nav className={`header_nav ${isMenuOpen ? 'header_nav--open' : ''}`}>
            <a href="#home" className="header_link" onClick={closeMenu}>Home</a>
            <a href="#menu" className="header_link" onClick={closeMenu}>Menu</a>
            <a href="#salads" className="header_link" onClick={closeMenu}>Salads</a>
            <a href="#pizzas" className="header_link" onClick={closeMenu}>Pizzas</a>
            <a href="#contact" className="header_link" onClick={closeMenu}>Contact</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
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
      </main>
    </>
  )
}

export default App
