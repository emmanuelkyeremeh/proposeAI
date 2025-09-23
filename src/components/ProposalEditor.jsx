import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProposal, updateProposal } from "../firebase/proposals";
import { improveText } from "../services/aiService";
import {
  generatePDF,
  downloadPDF,
  exportHTML,
  exportText,
  exportMarkdown,
} from "../services/pdfService";
import { uploadProposalPDF } from "../firebase/proposals";
import { usePageTitle } from "../hooks/usePageTitle";
import TiptapEditor from "./TiptapEditor";
import "./ProposalEditor.css";

const ProposalEditor = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [aiAction, setAiAction] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const editorRef = useRef(null);

  usePageTitle(
    proposal ? proposal.title || "Untitled Proposal" : "Proposal Editor"
  );

  useEffect(() => {
    loadProposal();
  }, [id]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest(".export-dropdown")) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportDropdown]);

  // Auto-save when content changes
  useEffect(() => {
    if (proposal && content) {
      // Check if content is meaningful (not just empty HTML)
      const isContentEmpty =
        content === "<p><br></p>" ||
        content === "<p></p>" ||
        content === "" ||
        (typeof content === "string" && content.trim().length === 0);

      if (!isContentEmpty) {
        const timeoutId = setTimeout(() => {
          saveProposal();
        }, 2000); // Save after 2 seconds of inactivity

        return () => clearTimeout(timeoutId);
      }
    }
  }, [content, proposal]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const proposalData = await getProposal(id);
      setProposal(proposalData);

      // Handle different content formats
      if (proposalData.content) {
        setContent(proposalData.content);
      } else {
        setContent("");
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      setError("Failed to load proposal");
    } finally {
      setLoading(false);
    }
  };

  const saveProposal = async () => {
    if (!proposal || saving) return;

    try {
      setSaving(true);
      await updateProposal(id, { content });
    } catch (error) {
      console.error("Error saving proposal:", error);
      setError("Failed to save proposal");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = React.useCallback((newContent) => {
    setContent(newContent);
  }, []);

  const handleTextSelection = React.useCallback((selectedText) => {
    setSelectedText(selectedText);
  }, []);

  const handleAiAction = React.useCallback(
    async (action) => {
      if (!selectedText.trim()) {
        alert("Please select some text first");
        return;
      }

      try {
        setAiAction(action);
        const improvedText = await improveText(selectedText, action);

        // Replace the selected text in the editor
        if (editorRef && editorRef.current && editorRef.current.replaceText) {
          editorRef.current.replaceText(improvedText);
        } else {
          // Fallback: replace in content
          const newContent = content.replace(selectedText, improvedText);
          setContent(newContent);
        }

        setSelectedText("");
      } catch (error) {
        console.error("Error improving text:", error);
        alert("Failed to improve text. Please try again.");
      } finally {
        setAiAction("");
      }
    },
    [selectedText, content, editorRef]
  );

  const handleExportPDF = React.useCallback(async () => {
    if (!proposal || !content || !id) {
      console.error("Missing required data for PDF export:", {
        proposal: !!proposal,
        content: !!content,
        id: !!id,
      });
      alert("Unable to export PDF. Please refresh the page and try again.");
      return;
    }

    try {
      setShowExportDropdown(false); // Close dropdown immediately to prevent multiple clicks

      const pdfBlob = await generatePDF(proposal, content);
      downloadPDF(pdfBlob, `${proposal.title || "proposal"}.pdf`);

      // Upload to Firebase Storage
      await uploadProposalPDF(id, pdfBlob);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(
        `Failed to export PDF: ${
          error.message || "Unknown error"
        }. Please try again.`
      );
    }
  }, [proposal, content, id]);

  const handleExportHTML = React.useCallback(() => {
    if (!proposal) return;
    exportHTML(proposal, content);
    setShowExportDropdown(false);
  }, [proposal, content]);

  const handleExportText = React.useCallback(() => {
    if (!proposal) return;
    exportText(proposal, content);
    setShowExportDropdown(false);
  }, [proposal, content]);

  const handleExportMarkdown = React.useCallback(() => {
    if (!proposal) return;
    exportMarkdown(proposal, content);
    setShowExportDropdown(false);
  }, [proposal, content]);

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      // Select all text - this will be handled by Tiptap
    }
  };

  if (loading) {
    return (
      <div className="proposal-editor">
        <div className="editor-header">
          <h2>Loading proposal...</h2>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-editor">
        <div className="editor-header">
          <h2>Proposal not found</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-editor">
      <div className="editor-header">
        <div className="header-left">
          <h2>{proposal.title || "Untitled Proposal"}</h2>
          <p className="client-info">
            Client: {proposal.clientName || "Unknown"} | Template:{" "}
            {proposal.template || "General"}
          </p>
        </div>
        <div className="header-actions">
          <div className="export-dropdown">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="btn primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Export"}
            </button>
            {showExportDropdown && (
              <div className="export-dropdown-menu">
                <button onClick={handleExportPDF} className="export-option">
                  📄 PDF Document
                </button>
                <button onClick={handleExportHTML} className="export-option">
                  🌐 HTML File
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="export-option"
                >
                  📝 Markdown File
                </button>
                <button onClick={handleExportText} className="export-option">
                  📄 Plain Text
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")} className="close-error">
            ×
          </button>
        </div>
      )}

      <div className="editor-content">
        <div className="ai-actions-panel">
          <h3>AI Text Assistant</h3>
          {selectedText ? (
            <div className="ai-actions">
              <button
                onClick={() => handleAiAction("rewrite")}
                disabled={aiAction === "rewrite"}
                className="ai-btn"
              >
                {aiAction === "rewrite" ? "Rewriting..." : "Rewrite"}
              </button>
              <button
                onClick={() => handleAiAction("expand")}
                disabled={aiAction === "expand"}
                className="ai-btn"
              >
                {aiAction === "expand" ? "Expanding..." : "Expand"}
              </button>
              <button
                onClick={() => handleAiAction("shorten")}
                disabled={aiAction === "shorten"}
                className="ai-btn"
              >
                {aiAction === "shorten" ? "Shortening..." : "Shorten"}
              </button>
            </div>
          ) : (
            <div className="no-selection">
              Select text to use AI improvements
            </div>
          )}
        </div>

        <div className="editor-container" onKeyDown={handleKeyDown}>
          <TiptapEditor
            ref={editorRef}
            content={content}
            onUpdate={handleContentChange}
            onSelectionChange={handleTextSelection}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalEditor;
