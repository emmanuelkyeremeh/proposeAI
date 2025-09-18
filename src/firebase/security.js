import { auth } from './config';

// Security service for additional client-side protection
// Note: This is NOT a replacement for server-side security rules

// Superuser email - should match the one in Firestore rules
const SUPERUSER_EMAIL = import.meta.env.VITE_FIREBASE_SUPERUSER_EMAIL;

// Check if current user is superuser
export const isCurrentUserSuperuser = () => {
  const user = auth.currentUser;
  return user && user.email === SUPERUSER_EMAIL;
};

// Validate user permissions before sensitive operations
export const validateUserPermission = (user, operation) => {
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Superuser has all permissions
  if (isCurrentUserSuperuser()) {
    return true;
  }

  // Add additional permission checks here
  switch (operation) {
    case 'create_proposal':
      return true; // Will be checked by subscription service
    case 'view_admin':
      return false; // Only superuser can view admin
    case 'manage_users':
      return false; // Only superuser can manage users
    default:
      return true;
  }
};

// Secure token validation (client-side only - server should validate)
export const validateAuthToken = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  
  // Additional token validation can be added here
  return user;
};

// Rate limiting helper (client-side)
const rateLimitMap = new Map();

export const checkRateLimit = (userId, action, maxAttempts = 10, windowMs = 60000) => {
  const now = Date.now();
  const key = `${userId}_${action}`;
  const attempts = rateLimitMap.get(key) || [];
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter(time => now - time < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  // Add current attempt
  validAttempts.push(now);
  rateLimitMap.set(key, validAttempts);
  
  return true;
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Secure random string generation
export const generateSecureId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Log security events (client-side only)
export const logSecurityEvent = (event, details = {}) => {
  console.warn(`Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    userId: auth.currentUser?.uid,
    userEmail: auth.currentUser?.email,
    ...details
  });
};
