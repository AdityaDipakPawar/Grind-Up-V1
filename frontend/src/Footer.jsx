import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer>
      <div className="footer-left">
        <div className="logo">
          <img src="/Logos/logo.png" alt="Logo" />
        </div>
        <div className="footer-section">
          <span className="footer-label">Know more about us:</span>
          <div className="social-links">
            <a href="https://www.instagram.com/grind._up?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/Logos/instagram.png" alt="Instagram" /></a>
            <a href="mailto:07grindup@gmail.com" aria-label="Gmail"><img src="/Logos/gmail.svg" alt="Google" /></a>
            <a href="https://www.linkedin.com/company/grindupco/" aria-label="LinkedIn"><img src="/Logos/LinkedIn Circled.svg" alt="LinkedIn" /></a>
            <a href="#" aria-label="Twitter"><img src="/Logos/x.svg" alt="Twitter" /></a>
          </div>
        </div>
      </div>
      <div className="footer-center">
        <a href="#">Contact us</a>
        <a href="#">Terms & Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">About us</a>
        <a href="#">FAQ</a>
      </div>
      {/* <div className="footer-right">
        <p>Download our app</p>
        <div className="app-buttons">
          <img src="/Logos/google-play.png" alt="Google Play" />
          <img src="/Logos/app-store.png" alt="App Store" />
        </div>
      </div> */}
    </footer>
  )
}

export default Footer
