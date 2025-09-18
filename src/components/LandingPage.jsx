import React from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  usePageTitle("AI-Powered Proposal Generator for Freelancers");

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Create Winning Proposals with{" "}
              <span className="brand-name">ProposeAI</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered proposal generator that helps freelancers and
              solopreneurs draft, edit, and export professional proposals in
              minutes. Save time and win more clients.
            </p>
            <div className="hero-actions">
              <button className="cta-button primary" onClick={handleGetStarted}>
                Get Started Free
              </button>
              <button
                className="cta-button secondary"
                onClick={() =>
                  document
                    .getElementById("features")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="proposal-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="preview-title">Project Proposal</div>
              </div>
              <div className="preview-content">
                <div className="preview-line long"></div>
                <div className="preview-line medium"></div>
                <div className="preview-line short"></div>
                <div className="preview-line long"></div>
                <div className="preview-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2>Why Choose ProposeAI?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Drafting</h3>
              <p>
                Generate professional proposals in seconds using advanced AI.
                Just describe your project and get a complete proposal draft.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✏️</div>
              <h3>Smart Editor</h3>
              <p>
                Edit with confidence using our intelligent text assistant.
                Rewrite, expand, or shorten any section with AI help.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>One-Click Export</h3>
              <p>
                Export your proposals as professional PDFs instantly. Perfect
                formatting every time, ready to send to clients.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Save Time</h3>
              <p>
                What used to take hours now takes minutes. Focus on your work
                while we handle the proposal writing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Describe Your Project</h3>
              <p>Tell us about your client, project scope, and requirements.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Generates Draft</h3>
              <p>
                Our AI creates a professional proposal tailored to your project.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Edit & Perfect</h3>
              <p>Use our smart editor to refine and customize your proposal.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Export & Win</h3>
              <p>Download as PDF and send to your client. Win more projects!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Win More Clients?</h2>
          <p>
            Join thousands of freelancers who are already using ProposeAI to
            create winning proposals.
          </p>
          <button
            className="cta-button primary large"
            onClick={handleGetStarted}
          >
            Start Creating Proposals Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>ProposeAI</h3>
              <p>
                AI-powered proposal generator for freelancers and solopreneurs.
              </p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="/login">Get Started</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ProposeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
