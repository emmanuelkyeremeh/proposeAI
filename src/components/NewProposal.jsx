import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateProposal } from "../services/aiService";
import { createProposal } from "../firebase/proposals";
import {
  canCreateProposal,
  incrementProposalUsage,
} from "../firebase/subscriptions";
import { usePageTitle } from "../hooks/usePageTitle";
import "./NewProposal.css";

const NewProposal = ({ user }) => {
  const navigate = useNavigate();
  usePageTitle("Create New Proposal");

  const [formData, setFormData] = useState({
    title: "",
    projectType: "",
    clientName: "",
    companyName: "",
    projectDescription: "",
    budget: "",
    timeline: "",
    requirements: "",
    template: "general",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [permissionCheck, setPermissionCheck] = useState({
    allowed: true,
    reason: "",
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkPermission();
  }, [user]);

  const checkPermission = async () => {
    if (!user) return;

    try {
      const permission = await canCreateProposal(user);
      setPermissionCheck(permission);
    } catch (error) {
      console.error("Error checking permission:", error);
      setPermissionCheck({ allowed: false, reason: "error" });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check permission before proceeding
    if (!permissionCheck.allowed) {
      if (permissionCheck.reason === "limit_reached") {
        setShowUpgradeModal(true);
      } else {
        setError(
          permissionCheck.details ||
            "You don't have permission to create proposals."
        );
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate AI proposal
      const aiContent = await generateProposal(formData, formData.template);
      console.log("AI Generated Content:", aiContent);
      console.log("AI Content Type:", typeof aiContent);
      console.log("AI Content Length:", aiContent ? aiContent.length : 0);

      // Create proposal in Firestore
      const proposalId = await createProposal(user.uid, {
        title: formData.title,
        clientName: formData.clientName,
        companyName: formData.companyName,
        projectType: formData.projectType,
        template: formData.template,
        content: aiContent,
        projectDetails: formData,
      });

      // Increment usage counter
      await incrementProposalUsage(user.uid);

      console.log("Created proposal with ID:", proposalId);

      // Navigate to editor
      navigate(`/proposal/${proposalId}`);
    } catch (error) {
      setError("Failed to generate proposal. Please try again.");
      console.error("Error generating proposal:", error);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { value: "general", label: "General Proposal" },
    { value: "web-dev", label: "Web Development" },
    { value: "design", label: "Design Project" },
    { value: "consulting", label: "Consulting" },
  ];

  return (
    <div className="new-proposal-container">
      <div className="new-proposal-header">
        <h1>Create New Proposal</h1>
        <p>
          Tell us about your project and we'll generate a professional proposal
        </p>
        {permissionCheck.allowed && permissionCheck.reason !== "superuser" && (
          <div className="usage-info">
            {permissionCheck.reason === "within_limits" && (
              <p className="usage-text">
                You have used {permissionCheck.used || 0} of{" "}
                {permissionCheck.limit || 3} proposals this month
              </p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="proposal-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Proposal Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Website Redesign for ABC Company"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="template">Template</label>
            <select
              id="template"
              name="template"
              value={formData.template}
              onChange={handleChange}
            >
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Client Name *</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="e.g., ABC Company"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Your Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Your Company Name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectType">Project Type *</label>
            <input
              type="text"
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              placeholder="e.g., Website Redesign, Mobile App, Branding"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Project Description *</label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            placeholder="Describe the project in detail. What are the goals, challenges, and expected outcomes?"
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budget">Budget Range</label>
            <input
              type="text"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., $5,000 - $10,000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeline">Timeline</label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              placeholder="e.g., 4-6 weeks, 2 months"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Specific Requirements</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="List any specific requirements, technologies, or constraints..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={loading || !permissionCheck.allowed}
          >
            {loading ? "Generating Proposal..." : "Generate Proposal"}
          </button>
        </div>
      </form>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Upgrade to Premium</h2>
              <button
                className="modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                You've reached your limit of{" "}
                {import.meta.env.VITE_FREE_PROPOSALS_LIMIT || 3} free proposals
                this month.
              </p>
              <p>
                Upgrade to Premium for unlimited proposals at just $
                {import.meta.env.VITE_PREMIUM_PRICE_USD || 2}/month!
              </p>
              <div className="modal-features">
                <ul>
                  <li>✓ Unlimited proposals</li>
                  <li>✓ All premium templates</li>
                  <li>✓ Advanced features</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/pricing");
                }}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProposal;
