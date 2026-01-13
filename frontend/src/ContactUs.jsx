import React from 'react';
import './contact.css';

const ContactUs = () => (
  <div className="container">
    
    <main>
      <div className="contact-content">
        <div className="contact-info">
          <div className="info-header">
            <h3>Get in touch with us Now!</h3>
          </div>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">
                <img src="/Logos/phone call.svg" alt="Phone" />
              </div>
              <div className="contact-details">
                <h4>Phone</h4>
                <p>+91 9372789670</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <img src="/Logos/email.svg" alt="Email" />
              </div>
              <div className="contact-details">
                <h4>Email</h4>
                <p>pastedhanashree@grindup.co</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <img src="/Logos/location.svg" alt="Location" />
              </div>
              <div className="contact-details">
                <h4>Address</h4>
                <p>Mumbai, Maharashtra India</p>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <img src="/Logos/clock.svg" alt="Hours" />
              </div>
              <div className="contact-details">
                <h4>Working Hours</h4>
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        <div className="enquiry-form">
          <div className="form-header">
            <h3>Enquire now!</h3>
          </div>
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <input type="text" placeholder="First name" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Last name" required />
              </div>
            </div>
            <div className="form-group">
              <input type="tel" placeholder="Mobile number" required />
            </div>
            <div className="form-group">
              <textarea placeholder="Message" rows="5" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>
      </div>
    </main>
  </div>
);

export default ContactUs; 