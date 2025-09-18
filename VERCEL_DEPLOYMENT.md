# Vercel Deployment Guide for ProposeAI

## 🚀 Quick Deployment Steps

### 1. **Prepare Your Environment Variables**

Create a `.env.local` file in your project root with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-firebase-app-id

# OpenRouter Configuration
VITE_OPENROUTER_API_KEY=your-openrouter-api-key

# Paystack Configuration (GHS Currency)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key_here

# Site Information
VITE_SITE_URL=https://proposeai.vercel.app
VITE_SITE_NAME=ProposeAI
```

### 2. **Deploy to Vercel**

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_OPENROUTER_API_KEY
vercel env add VITE_PAYSTACK_PUBLIC_KEY
vercel env add VITE_SITE_URL
vercel env add VITE_SITE_NAME

# Deploy to production
vercel --prod
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 3. **Configure Custom Domain (Optional)**

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain (e.g., `proposeai.com`)
3. Update DNS records as instructed
4. Update environment variables with new domain

### 4. **Update Firebase Auth Domains**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Add your Vercel domain: `proposeai.vercel.app`
5. Add your custom domain if you have one

### 5. **Update Paystack Webhook URLs**

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** > **Webhooks**
3. Update webhook URL to: `https://proposeai.vercel.app/api/paystack-webhook`
4. Select events: `subscription.create`, `subscription.disable`, `invoice.payment_failed`

## 🔧 **SEO Optimization Checklist**

### ✅ **Already Implemented:**
- Meta tags for all pages
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt
- Canonical URLs
- Mobile-responsive design

### 📈 **Additional SEO Steps:**

1. **Google Search Console**
   - Add your site to Google Search Console
   - Submit sitemap: `https://proposeai.vercel.app/sitemap.xml`
   - Monitor search performance

2. **Google Analytics**
   - Add Google Analytics tracking code
   - Monitor user behavior and conversions

3. **Page Speed Optimization**
   - Vercel automatically optimizes for speed
   - Images are automatically optimized
   - Code splitting is handled by Vite

4. **Content Optimization**
   - Add more content to landing page
   - Create blog posts about proposal writing
   - Add FAQ section

## 🛡️ **Security Checklist**

### ✅ **Already Implemented:**
- Firebase security rules
- Input sanitization
- Rate limiting
- HTTPS (automatic with Vercel)
- Security headers in vercel.json

### 🔒 **Additional Security:**
- Enable Vercel's DDoS protection
- Set up monitoring and alerts
- Regular security audits

## 📊 **Monitoring & Analytics**

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor performance metrics

2. **Error Tracking**
   - Consider adding Sentry for error tracking
   - Monitor user experience issues

3. **Uptime Monitoring**
   - Set up uptime monitoring with services like UptimeRobot
   - Get alerts for downtime

## 🚨 **Post-Deployment Checklist**

- [ ] Test all pages load correctly
- [ ] Test user registration and login
- [ ] Test proposal creation and editing
- [ ] Test payment flow with test cards
- [ ] Test admin dashboard access
- [ ] Test analytics dashboard
- [ ] Verify all environment variables are set
- [ ] Check Firebase rules are deployed
- [ ] Test mobile responsiveness
- [ ] Verify SEO meta tags are working
- [ ] Test social sharing (Open Graph)
- [ ] Check contact email is working

## 🎯 **Performance Optimization**

### **Already Optimized:**
- Vite build optimization
- Code splitting
- Image optimization
- CSS/JS minification
- Gzip compression (Vercel)

### **Additional Optimizations:**
- Add service worker for offline functionality
- Implement lazy loading for images
- Add preloading for critical resources

## 📱 **Mobile Optimization**

- Responsive design implemented
- Touch-friendly interface
- Mobile-optimized forms
- Fast loading on mobile networks

## 🌍 **International SEO**

- English language targeting
- Ghana-specific currency (GHS)
- International payment support
- Global accessibility

## 📈 **Growth Strategies**

1. **Content Marketing**
   - Blog about proposal writing tips
   - Case studies and success stories
   - Video tutorials

2. **Social Media**
   - Share on LinkedIn, Twitter
   - Create engaging content
   - Build community

3. **SEO Content**
   - Target keywords like "proposal generator", "AI proposals"
   - Create landing pages for specific industries
   - Build backlinks

4. **User Feedback**
   - Collect user testimonials
   - Implement feedback system
   - Continuous improvement

## 🆘 **Troubleshooting**

### Common Issues:
1. **Environment Variables Not Working**
   - Check variable names start with `VITE_`
   - Redeploy after adding variables

2. **Firebase Auth Issues**
   - Check authorized domains
   - Verify API keys are correct

3. **Payment Issues**
   - Check Paystack keys are live (not test)
   - Verify webhook URLs

4. **Build Errors**
   - Check for TypeScript errors
   - Verify all imports are correct

## 📞 **Support**

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Firebase Documentation: https://firebase.google.com/docs
- Contact: josephkyeremeh53@gmail.com

---

**Your app is now ready for production! 🎉**
