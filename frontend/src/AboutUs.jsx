import React from 'react';
import './about.css';

const AboutUs = () => (
  <div className="container">
    {/* <header>
      <div className="logo">
        <a href="/home">
          <img src="/Logos/logo.png" alt="Logo" />
        </a>
      </div>
      <nav className="navigation">
        <a href="/home" className="nav-link">Home</a>
        <a href="/placements" className="nav-link">Placements</a>
        <a href="/invite" className="nav-link">Invites</a>
        <a href="/contact" className="nav-link">Contact us</a>
      </nav>
      <div className="user-actions">
        <div className="notification-icon">
          <img src="/Logos/notification.svg" alt="Notifications" />
        </div>
        <div className="profile-icon">
          <img src="/Logos/profile.svg" alt="Profile" />
        </div>
      </div>
    </header> */}
    <main>
      <div className="about-content">
        <div className="about-header">
          <h1>ABOUT US</h1>
        </div>

        <section className="founder-section">
          <div className="founder-content">
            <p className="founder-text">
              GrindUp was born from a personal experience of frustration in the job market. I realized that students don't fail because they lack talent, but because they lack clarity on what the industry actually expects.
            </p>
            <p className="founder-text">
              We started GrindUp to fix this gap—by bringing transparency into placements and turning real hiring outcomes into learning and improvement. Our goal is simple: help students prepare better, help colleges place better, and help companies hire better.
            </p>
            <div className="founder-signature">
              <p className="signature-name">— Miss. Dhanashree Paste</p>
              <p className="signature-title">Founder, GrindUp</p>
            </div>
          </div>
        </section>

        <section className="cto-section">
          <div className="cto-content">
            <p className="cto-text">
              At GrindUp, our focus is on building systems that are simple, reliable, and meaningful. We design technology that supports real-world placement workflows, captures genuine hiring feedback, and converts it into actionable insights—without adding complexity for colleges or companies.
            </p>
            <p className="cto-text">
              Our responsibility is to ensure that the platform scales with trust, accuracy, and clarity at its core. Technology is not the solution by itself. But when built right, it becomes a powerful enabler.
            </p>
            <div className="cto-signature">
              <p className="signature-name">— Mr. Aditya Pawar</p>
              <p className="signature-title">CTO, GrindUp</p>
            </div>
          </div>
        </section>
        {/* <section className="blogs-section">
          <h2>Our Blogs</h2>
          <div className="blogs-grid">
            <div className="blog-card">
              <div className="blog-image">
                <img src="/Logos/blog-placeholder.jpg" alt="Blog Image" />
              </div>
              <div className="blog-content">
                <h3>How to Ace Your First Job Interview</h3>
                <p>Essential tips and strategies to help you prepare for your first job interview and make a lasting impression.</p>
                <span className="blog-date">March 15, 2024</span>
              </div>
            </div>
            <div className="blog-card">
              <div className="blog-image">
                <img src="/Logos/blog-placeholder.jpg" alt="Blog Image" />
              </div>
              <div className="blog-content">
                <h3>Top Skills Employers Look For in 2024</h3>
                <p>Discover the most in-demand skills that employers are seeking in today's competitive job market.</p>
                <span className="blog-date">March 10, 2024</span>
              </div>
            </div>
            <div className="blog-card">
              <div className="blog-image">
                <img src="/Logos/blog-placeholder.jpg" alt="Blog Image" />
              </div>
              <div className="blog-content">
                <h3>Building Your Professional Network</h3>
                <p>Learn effective strategies for building and maintaining professional relationships that can boost your career.</p>
                <span className="blog-date">March 5, 2024</span>
              </div>
            </div>
            <div className="blog-card">
              <div className="blog-image">
                <img src="/Logos/blog-placeholder.jpg" alt="Blog Image" />
              </div>
              <div className="blog-content">
                <h3>Resume Writing Best Practices</h3>
                <p>Create a compelling resume that stands out to recruiters and effectively showcases your qualifications.</p>
                <span className="blog-date">February 28, 2024</span>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    </main>
    {/* <footer>
      <div className="footer-left">
        <div className="logo">
          <img src="/Logos/logo.png" alt="Logo" />
        </div>
        <div className="footer-section">
          <p>Know more about us :</p>
          <div className="social-links">
            <a href="#"><img src="/Logos/instagram-stroke-rounded.svg" alt="Instagram" /></a>
            <a href="#"><img src="/Logos/email.svg" alt="Gmail" /></a>
            <a href="#"><img src="/Logos/LinkedIn.svg" alt="LinkedIn" /></a>
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
      <div className="footer-right">
        <p>Download our app</p>
        <div className="app-buttons">
          <img src="/Logos/google-play.png" alt="Google Play" />
          <img src="/Logos/app-store.png" alt="App Store" />
        </div>
      </div>
    </footer> */}
  </div>
);

export default AboutUs; 