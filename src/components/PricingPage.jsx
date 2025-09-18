import React, { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { createSubscription } from "../firebase/subscriptions";
import { getCurrentUser } from "../firebase/auth";
import "./PricingPage.css";

const PricingPage = ({ user, onSubscriptionUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Paystack configuration
  const publicKey =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here";
  const amount = parseInt(import.meta.env.VITE_PREMIUM_PRICE_PESEWAS) || 50000; // Premium price in pesewas
  const currency = import.meta.env.VITE_CURRENCY_CODE || "GHS";
  const priceUSD = import.meta.env.VITE_PREMIUM_PRICE_USD || 5;
  const priceGHS = import.meta.env.VITE_PREMIUM_PRICE_GHS || 500;

  useEffect(() => {
    // Load current subscription status
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { getUserSubscription } = await import("../firebase/subscriptions");
      const sub = await getUserSubscription(user.uid);
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Create subscription in Firebase
      await createSubscription(currentUser.uid, {
        customerId: response.customer?.customer_code,
        subscriptionId: response.subscription?.subscription_code,
        reference: response.reference,
      });

      // Reload subscription data
      await loadSubscription();

      // Notify parent component
      if (onSubscriptionUpdate) {
        onSubscriptionUpdate();
      }

      alert("Payment successful! You now have unlimited proposals.");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(
        "Payment successful but there was an error updating your subscription. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    console.log("Payment cancelled");
  };

  const paystackProps = {
    email: user?.email || "",
    amount: amount,
    currency: currency,
    publicKey: publicKey,
    text: `Subscribe Now - $${priceUSD}/month`,
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
    metadata: {
      userId: user?.uid,
      plan: "premium",
      custom_fields: [
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.uid,
        },
      ],
    },
  };

  const isPremium =
    subscription?.plan === "premium" && subscription?.status === "active";

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        <div className="pricing-header">
          <h1>Choose Your Plan</h1>
          <p>
            Unlock the full potential of ProposeAI with our flexible pricing
          </p>
        </div>

        <div className="pricing-cards">
          {/* Free Plan */}
          <div className={`pricing-card ${!isPremium ? "current-plan" : ""}`}>
            <div className="plan-header">
              <h3>Free Plan</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                <li>
                  ✓ {import.meta.env.VITE_FREE_PROPOSALS_LIMIT || 3} proposals
                  per month
                </li>
                <li>✓ AI-powered proposal generation</li>
                <li>✓ PDF export</li>
                <li>✓ Basic templates (4 templates)</li>
                <li>✓ Basic proposal editor</li>
                <li>✗ Analytics dashboard</li>
                <li>✗ Advanced templates</li>
                <li>✗ Custom branding</li>
                <li>✗ Priority support</li>
              </ul>
            </div>
            <div className="plan-status">
              {!isPremium && (
                <span className="current-badge">Current Plan</span>
              )}
            </div>
          </div>

          {/* Premium Plan */}
          <div
            className={`pricing-card premium ${
              isPremium ? "current-plan" : ""
            }`}
          >
            <div className="plan-badge">Most Popular</div>
            <div className="plan-header">
              <h3>Premium Plan</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">{priceUSD}</span>
                <span className="period">/month</span>
                <div className="currency-note">(~{priceGHS} GHS)</div>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                <li>
                  ✓{" "}
                  {import.meta.env.VITE_PREMIUM_PROPOSALS_LIMIT === "-1"
                    ? "Unlimited"
                    : import.meta.env.VITE_PREMIUM_PROPOSALS_LIMIT}{" "}
                  proposals
                </li>
                <li>✓ AI-powered proposal generation</li>
                <li>✓ PDF export</li>
                <li>✓ All templates (10+ templates)</li>
                <li>✓ Advanced proposal editor</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ Advanced AI features</li>
                <li>✓ Custom branding</li>
                <li>✓ Priority support</li>
                <li>✓ Export to multiple formats</li>
                <li>✓ Advanced templates</li>
                <li>✓ Usage insights</li>
              </ul>
            </div>
            <div className="plan-actions">
              {isPremium ? (
                <div className="subscription-status">
                  <span className="active-badge">✓ Active Subscription</span>
                  <p>
                    Next billing:{" "}
                    {subscription?.nextBillingDate
                      ? new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              ) : (
                <PaystackButton
                  {...paystackProps}
                  className="subscribe-button"
                  disabled={loading}
                />
              )}
            </div>
          </div>
        </div>

        <div className="pricing-footer">
          <p>All plans include secure payment processing via Paystack</p>
          <p>Cancel anytime • No setup fees • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
