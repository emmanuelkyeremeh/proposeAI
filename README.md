# 📝 ProposeAI

**AI-powered proposal generator for freelancers and solopreneurs**

Create professional proposals in minutes with ProposeAI. Our AI-powered platform helps freelancers, consultants, and solopreneurs generate high-quality proposals that win more clients.

## ✨ Features

### 🆓 **Free Plan**
- 3 proposals per month
- AI-powered proposal generation
- PDF export
- Basic templates (4 templates)
- Basic proposal editor

### ⭐ **Premium Plan ($5/month)**
- Unlimited proposals
- Advanced AI features
- Analytics dashboard
- All templates (10+ templates)
- Advanced proposal editor
- Custom branding
- Priority support
- Export to multiple formats
- Usage insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase account
- OpenRouter API key
- Paystack account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/proposeai.git
   cd proposeai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp example.env .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_OPENROUTER_API_KEY=your-openrouter-api-key
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
   VITE_SITE_URL=http://localhost:5173
   VITE_SITE_NAME=ProposeAI
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: CSS3 with modern features
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: OpenRouter API
- **Payments**: Paystack (GHS currency)
- **Deployment**: Vercel
- **Editor**: Tiptap (rich text editor)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # User dashboard
│   ├── LandingPage.jsx  # Landing page
│   ├── PricingPage.jsx  # Pricing plans
│   ├── AnalyticsDashboard.jsx # Premium analytics
│   ├── SuperuserDashboard.jsx # Admin dashboard
│   └── ...
├── firebase/           # Firebase configuration
│   ├── config.js       # Firebase setup
│   ├── auth.js         # Authentication
│   ├── proposals.js    # Proposal CRUD
│   ├── subscriptions.js # Subscription management
│   └── security.js     # Security utilities
├── services/           # External services
│   ├── aiService.js    # AI integration
│   └── pdfService.js   # PDF generation
└── hooks/              # Custom React hooks
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Set up Storage bucket
5. Deploy security rules: `firebase deploy --only firestore:rules`

### Paystack Setup
1. Create Paystack account
2. Get API keys from dashboard
3. Configure webhooks for subscription events
4. Test with test cards

### OpenRouter Setup
1. Sign up at [OpenRouter](https://openrouter.ai)
2. Get API key
3. Add to environment variables

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Set environment variables in Vercel dashboard
5. Deploy to production: `vercel --prod`

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- Firebase security rules for data protection
- Input sanitization and validation
- Rate limiting for API calls
- Secure authentication with Firebase Auth
- HTTPS enforcement in production

## 📊 SEO Features

- Meta tags and Open Graph tags
- Structured data (JSON-LD)
- Sitemap and robots.txt
- Mobile-responsive design
- Fast loading times
- Social media optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: josephkyeremeh53@gmail.com
- **Website**: [proposeai.vercel.app](https://proposeai.vercel.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/proposeai/issues)

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) for backend services
- [OpenRouter](https://openrouter.ai) for AI capabilities
- [Paystack](https://paystack.com) for payment processing
- [Vercel](https://vercel.com) for deployment platform
- [Tiptap](https://tiptap.dev) for rich text editing

---

**Built with ❤️ by [Joseph Kyeremeh](mailto:josephkyeremeh53@gmail.com)**