import './App.css'
import logo from './assets/logo.svg'

function App() {
  
  return (
    <>
      <header className="header">
        <div className="header__content">
          <nav className="header__nav">
            <a href="#specials" className="header__link">Specials</a>
            <a href="#contact" className="header__link">Sign In</a>
            <a href="#menu" className="header__link">Menu</a>
            <a href="#about" className="header__link">About Us</a>
          </nav>
          <img src={logo} alt="Operation Pizzaria Logo" className="header-logo" />
          <h1 className="header-name">Operation Pizzaria</h1>
        </div>
      </header>
      <main>
        <section id="menu">
          <h2>Our Menu</h2>
          <p>Check out our delicious pizzas!</p>
        </section>
        <section id="about">
          <h2>About Us</h2>
          <p>Learn more about our pizzeria.</p>
        </section>
        <section id="contact">
          <h2>Contact</h2>
          <p>Get in touch with us.</p>
        </section>
      </main>
    </>
  )
}

export default App
