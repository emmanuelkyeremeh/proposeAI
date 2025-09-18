import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from './config';

// Superuser email - this should be set in environment variables in production
const SUPERUSER_EMAIL = import.meta.env.VITE_FIREBASE_SUPERUSER_EMAIL;

// Check if user is superuser
export const isSuperuser = (user) => {
  return user && user.email === SUPERUSER_EMAIL;
};

// Get user subscription data
export const getUserSubscription = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // If no subscription data exists, initialize it
      if (!userData.subscription) {
        const initialSubscription = {
          plan: 'free',
          status: 'active',
          proposalsUsed: 0,
          proposalsLimit: parseInt(import.meta.env.VITE_FREE_PROPOSALS_LIMIT) || 3,
          subscriptionDate: null,
          nextBillingDate: null,
          paystackCustomerId: null,
          paystackSubscriptionId: null,
          createdAt: serverTimestamp()
        };
        
        // Update the user document with initial subscription
        await updateDoc(doc(db, 'users', userId), {
          subscription: initialSubscription
        });
        
        return initialSubscription;
      }
      
      return {
        plan: userData.subscription.plan || 'free',
        status: userData.subscription.status || 'active',
        proposalsUsed: userData.subscription.proposalsUsed || 0,
        proposalsLimit: userData.subscription.proposalsLimit || (parseInt(import.meta.env.VITE_FREE_PROPOSALS_LIMIT) || 3),
        subscriptionDate: userData.subscription.subscriptionDate || null,
        nextBillingDate: userData.subscription.nextBillingDate || null,
        paystackCustomerId: userData.subscription.paystackCustomerId || null,
        paystackSubscriptionId: userData.subscription.paystackSubscriptionId || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
};

// Update user subscription
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      subscription: {
        ...subscriptionData,
        updatedAt: serverTimestamp()
      }
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

// Create subscription after successful payment
export const createSubscription = async (userId, paymentData) => {
  try {
    const subscriptionData = {
      plan: 'premium',
      status: 'active',
      proposalsUsed: 0,
      proposalsLimit: parseInt(import.meta.env.VITE_PREMIUM_PROPOSALS_LIMIT) || -1, // -1 means unlimited
      subscriptionDate: serverTimestamp(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paystackCustomerId: paymentData.customerId,
      paystackSubscriptionId: paymentData.subscriptionId,
      paymentReference: paymentData.reference
    };
    
    await updateUserSubscription(userId, subscriptionData);
    return subscriptionData;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Increment proposal usage
export const incrementProposalUsage = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.proposalsUsed': increment(1),
      'subscription.updatedAt': serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing proposal usage:', error);
    throw error;
  }
};

// Sync proposal usage with actual proposal count
export const syncProposalUsage = async (userId, actualCount) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.proposalsUsed': actualCount,
      'subscription.updatedAt': serverTimestamp()
    });
  } catch (error) {
    console.error('Error syncing proposal usage:', error);
    throw error;
  }
};

// Check if user can create proposal
export const canCreateProposal = async (user) => {
  try {
    // Superuser has unlimited access
    if (isSuperuser(user)) {
      return { allowed: true, reason: 'superuser' };
    }

    const subscription = await getUserSubscription(user.uid);
    if (!subscription) {
      return { allowed: false, reason: 'no_subscription' };
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return { allowed: false, reason: 'inactive_subscription' };
    }

    // Check usage limits
    if (subscription.plan === 'free') {
      if (subscription.proposalsUsed >= subscription.proposalsLimit) {
        return { 
          allowed: false, 
          reason: 'limit_reached',
          details: `You've used ${subscription.proposalsUsed}/${subscription.proposalsLimit} free proposals this month. Upgrade to premium for unlimited proposals.`,
          used: subscription.proposalsUsed,
          limit: subscription.proposalsLimit
        };
      }
    }

    return { 
      allowed: true, 
      reason: 'within_limits',
      used: subscription.proposalsUsed,
      limit: subscription.proposalsLimit
    };
  } catch (error) {
    console.error('Error checking proposal creation permission:', error);
    return { allowed: false, reason: 'error' };
  }
};

// Get all users for superuser dashboard
export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        profession: userData.profession,
        subscription: userData.subscription || {
          plan: 'free',
          status: 'active',
          proposalsUsed: 0,
          proposalsLimit: parseInt(import.meta.env.VITE_FREE_PROPOSALS_LIMIT) || 3
        },
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      });
    });
    
    return users.sort((a, b) => new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate()));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get subscription statistics
export const getSubscriptionStats = async () => {
  try {
    const users = await getAllUsers();
    
    const stats = {
      totalUsers: users.length,
      freeUsers: users.filter(user => user.subscription.plan === 'free').length,
      premiumUsers: users.filter(user => user.subscription.plan === 'premium').length,
      totalProposals: users.reduce((sum, user) => sum + (user.subscription.proposalsUsed || 0), 0),
      monthlyRevenue: users.filter(user => user.subscription.plan === 'premium').length * (import.meta.env.VITE_PREMIUM_PRICE_USD || 5) // Premium price per user
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelSubscription = async (userId) => {
  try {
    const subscriptionData = {
      status: 'cancelled',
      cancelledAt: serverTimestamp()
    };
    
    await updateUserSubscription(userId, subscriptionData);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};
