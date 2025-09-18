import React from "react";
import { getUserSubscription } from "../firebase/subscriptions";
import { useState, useEffect } from "react";
import "./PremiumFeatures.css";

const PremiumFeatures = ({ user, children, featureName }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="premium-feature-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const isPremium =
    subscription?.plan === "premium" && subscription?.status === "active";

  if (isPremium) {
    return children;
  }

  return (
    <div className="premium-feature-lock">
      <div className="lock-icon">🔒</div>
      <h3>Premium Feature</h3>
      <p>{featureName} is available for Premium users only.</p>
      <div className="premium-benefits">
        <h4>Premium Benefits:</h4>
        <ul>
          <li>✓ Unlimited proposals</li>
          <li>✓ Advanced AI templates</li>
          <li>✓ Analytics dashboard</li>
          <li>✓ Priority support</li>
          <li>✓ Export to multiple formats</li>
          <li>✓ Custom branding</li>
        </ul>
      </div>
      <div className="premium-actions">
        <a href="/pricing" className="upgrade-btn">
          Upgrade to Premium - ${import.meta.env.VITE_PREMIUM_PRICE_USD || 5}
          /month
        </a>
        <p className="upgrade-note">
          Cancel anytime • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
};

export default PremiumFeatures;
