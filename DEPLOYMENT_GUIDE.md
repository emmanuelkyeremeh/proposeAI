# Firebase Deployment Guide

## Quick Setup for Firestore Rules

Since you're getting the "Not in a Firebase app directory" error, here are the steps to fix it:

### Option 1: Initialize Firebase (Recommended)

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Initialize Firebase in your project:**
   ```bash
   firebase init firestore
   ```
   - Select your existing Firebase project
   - Use the existing `firestore.rules` file (don't overwrite)
   - Use the existing `firestore.indexes.json` file (don't overwrite)

3. **Deploy the rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Manual Deployment via Firebase Console

If the CLI approach doesn't work:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database > Rules
4. Copy the contents of `firestore.rules` and paste it there
5. Click "Publish"

## Environment Variables

Make sure your `.env` file has the correct Paystack key:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_paystack_key_here
```

## Testing the Payment System

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the pricing page:**
   - Navigate to `/pricing`
   - The page should load without errors
   - You should see the pricing plans

3. **Test payment flow:**
   - Click "Subscribe Now" on the Premium plan
   - Use Paystack test card: `4084084084084081`
   - Use any future expiry date and any CVV
   - Note: Payment will be processed in GHS (Ghana Cedi) but displayed as $5

## Common Issues Fixed

✅ **Pricing page error**: Fixed `process.env` to `import.meta.env` for Vite
✅ **Styling consistency**: Updated all buttons to use green theme
✅ **Firebase rules**: Created proper configuration files

## Next Steps

1. Get your Paystack test public key
2. Add it to your `.env` file
3. Deploy Firestore rules using one of the methods above
4. Test the complete payment flow

The app should now work without errors!
