# ProposeAI Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install quill pdf-lib react-quill react-router-dom
```

### 2. Environment Variables Setup

1. Copy the example environment file:
   ```bash
   cp example.env .env.local
   ```

2. Update `.env.local` with your actual values:
   - **Firebase Config**: Get from Firebase Console > Project Settings > General > Your apps
   - **OpenRouter API Key**: Get from [OpenRouter](https://openrouter.ai/)

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication, Firestore Database, and Storage
4. Get your Firebase config from Project Settings > General > Your apps
5. Add the values to your `.env.local` file

### 4. OpenRouter API Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get your API key
3. Add the API key to your `.env.local` file
4. The app is configured to use the free "Llama 3.3 8B Instruct" model

### 5. Firebase Security Rules

**IMPORTANT**: You must set up these security rules or you'll get "Missing or insufficient permissions" errors.

#### Firestore Rules
1. Go to **Firebase Console** → **Firestore Database** → **Rules**
2. Replace the existing rules with the content from `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own proposals
    match /proposals/{proposalId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage Rules
1. Go to **Firebase Console** → **Storage** → **Rules**
2. Replace the existing rules with the content from `storage.rules` file:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload and read their own proposal PDFs
    match /proposals/{proposalId}.pdf {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Run the Application

```bash
npm run dev
```

## 🎯 Features Implemented

### ✅ Authentication
- Firebase Authentication with Google and Email/Password
- User profile management
- Protected routes

### ✅ AI Proposal Generation
- OpenRouter integration for AI text generation
- Multiple proposal templates (General, Web Dev, Design, Consulting)
- Project details form for context

### ✅ Rich Text Editor
- Quill.js integration with custom toolbar
- Inline AI text improvements (Rewrite, Expand, Shorten, Improve)
- Auto-save functionality

### ✅ PDF Export
- Client-side PDF generation with PDF-Lib
- Firebase Storage integration
- One-click download

### ✅ Dashboard
- Proposal management
- Recent proposals list
- Usage statistics
- Modern, responsive UI

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_OPENROUTER_API_KEY=your-openrouter-key
```

Then update `firebase/config.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 🚨 Important Notes

1. **OpenRouter API Key**: Make sure to keep your API key secure and never commit it to version control.

2. **Firebase Security**: The provided security rules are basic. For production, implement more sophisticated rules based on your needs.

3. **Free Tier Limits**: The app is configured for free tier usage. Consider implementing usage tracking and limits.

4. **Error Handling**: The app includes basic error handling. Consider adding more comprehensive error boundaries for production.

## 🎨 Customization

### Styling
- All styles are in individual CSS files for each component
- Uses CSS custom properties for easy theming
- Responsive design for mobile and desktop

### AI Models
- Currently using `microsoft/wizardlm-2-8x22b` (free model)
- Can be changed in `aiService.js`
- Consider upgrading to paid models for better quality

### Templates
- Add new templates in `NewProposal.jsx`
- Update AI prompts in `aiService.js` for template-specific content

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Auth Not Working**
   - Check Firebase config
   - Ensure Authentication is enabled in Firebase Console
   - Verify domain is authorized

2. **AI Generation Failing**
   - Check OpenRouter API key
   - Verify API key has sufficient credits
   - Check network connectivity

3. **PDF Export Not Working**
   - Ensure PDF-Lib is properly installed
   - Check browser compatibility
   - Verify Firebase Storage rules

4. **Quill Editor Not Loading**
   - Check if react-quill is installed
   - Verify CSS imports
   - Check for JavaScript errors in console

## 📱 Mobile Support

The app is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔄 Next Steps

1. Set up your Firebase project
2. Get your OpenRouter API key
3. Update the configuration files
4. Run `npm run dev`
5. Start creating proposals!

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all configuration steps
3. Ensure all dependencies are installed
4. Check Firebase and OpenRouter service status
