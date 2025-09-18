#!/bin/bash

echo "🚀 Setting up Firebase for ProposeAI..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    firebase login
fi

echo "📁 Initializing Firebase Firestore..."
firebase init firestore --project $(firebase projects:list | head -n 2 | tail -n 1 | awk '{print $1}')

echo "🚀 Deploying Firestore rules..."
firebase deploy --only firestore:rules

echo "✅ Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Paystack public key to .env file"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the payment system at /pricing"
