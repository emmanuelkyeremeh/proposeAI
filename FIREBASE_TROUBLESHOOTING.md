# Firebase Troubleshooting

## Console Errors: `net::ERR_BLOCKED_BY_CLIENT`

If you see errors like:
```
POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Fproposeai-29b2b%2Fdatabases%2F(default)&gsessionid=... net::ERR_BLOCKED_BY_CLIENT
```

### Common Causes:
1. **Ad Blockers**: Browser extensions like uBlock Origin, AdBlock Plus, etc.
2. **Privacy Extensions**: Extensions that block tracking or analytics
3. **Corporate Firewalls**: Some corporate networks block Firebase domains
4. **Browser Settings**: Enhanced privacy settings

### Solutions:
1. **Disable Ad Blockers**: Temporarily disable ad blockers for localhost:5173
2. **Whitelist Firebase**: Add Firebase domains to your ad blocker's whitelist:
   - `firestore.googleapis.com`
   - `firebase.googleapis.com`
   - `firebaseapp.com`
3. **Use Incognito Mode**: Test in incognito/private browsing mode
4. **Check Browser Console**: Look for specific blocked requests

### Firebase Domains to Whitelist:
- `*.googleapis.com`
- `*.firebaseapp.com`
- `*.firebaseio.com`
- `*.cloudfunctions.net`

### Note:
These errors don't affect the app's functionality in most cases - they're just network requests being blocked by browser extensions. The app will still work, but you might see these console warnings.
