import React from "react";
import "./Footer.css";

const Footer = () => {
  const contactEmail =
    import.meta.env.VITE_CONTACT_EMAIL || "josephkyeremeh53@gmail.com";

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>📝 ProposeAI</h3>
            <p>
              AI-powered proposal generator for freelancers and solopreneurs
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="/pricing">Pricing</a>
                </li>
                <li>
                  <a href="/analytics">Analytics</a>
                </li>
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href={`mailto:${contactEmail}`}>Contact Us</a>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`}>Help & Support</a>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`}>Feature Requests</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a
                    href="https://github.com/yourusername/proposeai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`}>Partnership</a>
                </li>
                <li>
                  <a href={`mailto:${contactEmail}`}>Feedback</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2024 ProposeAI. All rights reserved.</p>
          </div>
          <div className="footer-contact">
            <p>
              <strong>Contact:</strong>{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
