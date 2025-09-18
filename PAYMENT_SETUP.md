# Payment System Setup Guide

This guide will help you set up the Paystack payment system for ProposeAI with user restrictions and superuser functionality.

## 🚀 Features Implemented

### User Tiers
- **Free Users**: 3 proposals per month
- **Premium Users**: Unlimited proposals for $5/month
- **Superuser**: Unlimited access (josephkyeremeh53@gmail.com)

### Security Features
- Server-side Firebase security rules
- Client-side permission validation
- Rate limiting protection
- Input sanitization
- Superuser access control

## 📋 Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration (already set up)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-firebase-app-id

# OpenRouter Configuration (already set up)
VITE_OPENROUTER_API_KEY=your-openrouter-api-key

# Paystack Configuration (NEW)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

### 2. Paystack Setup

1. **Create Paystack Account**
   - Go to [paystack.com](https://paystack.com)
   - Sign up for a developer account
   - Complete verification process

2. **Get API Keys**
   - Go to Settings > API Keys & Webhooks
   - Copy your Test Public Key (starts with `pk_test_`)
   - Add it to your `.env` file

3. **Configure Webhooks** (Optional but recommended)
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/paystack-webhook`
   - Select events: `subscription.create`, `subscription.disable`, `invoice.payment_failed`

### 3. Firebase Security Rules

The Firestore security rules have been updated to include:
- Superuser access control
- User data protection
- Admin collection access

Deploy the updated rules:
```bash
firebase deploy --only firestore:rules
```

### 4. User Subscription System

The system automatically:
- Tracks proposal usage for free users
- Enforces monthly limits
- Handles subscription upgrades
- Manages superuser permissions

### 5. Testing the System

1. **Test Free User Flow**
   - Create a new account
   - Try creating 4 proposals (should be blocked after 3)
   - Verify upgrade modal appears

2. **Test Premium User Flow**
   - Go to /pricing page
   - Click "Subscribe Now"
   - Complete Paystack payment
   - Verify unlimited access

3. **Test Superuser Flow**
   - Login with josephkyeremeh53@gmail.com
   - Verify admin dashboard access
   - Check user management features

## 🔧 Configuration Files

### Key Files Added/Modified

1. **Payment Components**
   - `src/components/PricingPage.jsx` - Pricing page with Paystack integration
   - `src/components/PricingPage.css` - Styling for pricing page

2. **Admin Dashboard**
   - `src/components/SuperuserDashboard.jsx` - Admin dashboard
   - `src/components/SuperuserDashboard.css` - Admin dashboard styling

3. **Subscription Management**
   - `src/firebase/subscriptions.js` - User subscription logic
   - `src/firebase/security.js` - Security utilities

4. **Updated Components**
   - `src/components/NewProposal.jsx` - Added usage tracking
   - `src/components/Dashboard.jsx` - Added subscription info
   - `src/components/Navbar.jsx` - Added pricing and admin links
   - `src/App.jsx` - Added new routes

5. **Security Rules**
   - `firestore.rules` - Updated with superuser access
   - `example.env` - Added Paystack configuration

## 🛡️ Security Features

### Client-Side Security
- Permission validation before operations
- Rate limiting protection
- Input sanitization
- Secure token validation

### Server-Side Security
- Firebase security rules
- Superuser email verification
- User data isolation
- Admin access control

### Anti-Tampering Measures
- Server-side usage tracking
- Firebase security rules enforcement
- Client-side validation as backup only
- Secure superuser identification

## 📊 Admin Dashboard Features

The superuser dashboard (`/admin`) provides:
- User statistics and analytics
- Subscription management
- Usage tracking
- Revenue monitoring
- User search and filtering

## 🔄 Usage Tracking

The system tracks:
- Proposal creation attempts
- Monthly usage limits
- Subscription status
- Payment history
- User activity

## 🚨 Important Notes

1. **Superuser Access**: Only `josephkyeremeh53@gmail.com` has superuser privileges
2. **Security**: All security is enforced server-side via Firebase rules
3. **Payments**: Test with Paystack test keys first
4. **Backup**: Regular database backups recommended
5. **Monitoring**: Monitor usage and payments through admin dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Payment Not Working**
   - Check Paystack public key in `.env`
   - Verify Paystack account is active
   - Check browser console for errors

2. **Usage Limits Not Working**
   - Check Firebase security rules
   - Verify subscription service is working
   - Check user authentication

3. **Admin Dashboard Not Accessible**
   - Verify superuser email matches exactly
   - Check Firebase authentication
   - Verify Firestore rules are deployed

### Debug Commands

```bash
# Check Firebase rules
firebase firestore:rules:get

# Deploy rules
firebase deploy --only firestore:rules

# Check environment variables
echo $VITE_PAYSTACK_PUBLIC_KEY
```

## 📈 Next Steps

1. **Production Setup**
   - Switch to Paystack live keys
   - Set up production webhooks
   - Configure domain restrictions

2. **Monitoring**
   - Set up error tracking
   - Monitor payment success rates
   - Track user engagement

3. **Features**
   - Add subscription cancellation
   - Implement usage analytics
   - Add email notifications

## 🆘 Support

For issues with:
- **Paystack**: Contact Paystack support
- **Firebase**: Check Firebase documentation
- **Code**: Review error logs and console output

---

**Note**: This implementation provides a solid foundation for a subscription-based SaaS application. Always test thoroughly in a development environment before deploying to production.
