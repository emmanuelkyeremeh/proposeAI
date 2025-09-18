import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Create a new proposal
export const createProposal = async (userId, proposalData) => {
  try {
    console.log("Creating proposal with data:", proposalData);
    console.log("Content being saved:", proposalData.content);
    
    const docRef = await addDoc(collection(db, 'proposals'), {
      ...proposalData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Proposal created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating proposal:", error);
    throw error;
  }
};

// Update a proposal
export const updateProposal = async (proposalId, updateData) => {
  try {
    const proposalRef = doc(db, 'proposals', proposalId);
    await updateDoc(proposalRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

// Delete a proposal
export const deleteProposal = async (proposalId) => {
  try {
    await deleteDoc(doc(db, 'proposals', proposalId));
  } catch (error) {
    throw error;
  }
};

// Get all proposals for a user
export const getUserProposals = async (userId) => {
  try {
    const q = query(
      collection(db, 'proposals'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get a specific proposal
export const getProposal = async (proposalId) => {
  try {
    const docRef = doc(db, 'proposals', proposalId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Proposal not found');
    }
  } catch (error) {
    throw error;
  }
};

// Upload PDF to Firebase Storage
export const uploadProposalPDF = async (proposalId, pdfBlob) => {
  try {
    const storageRef = ref(storage, `proposals/${proposalId}.pdf`);
    const snapshot = await uploadBytes(storageRef, pdfBlob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};
