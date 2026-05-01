import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: Must use firestoreDatabaseId for custom instances
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = () => auth.signOut();

// CRITICAL CONSTRAINT: Validate connection to Firestore
async function testConnection() {
  try {
    const config = firebaseConfig as any;
    console.log("Firebase Init: Project ID =", config.projectId);
    console.log("Firebase Init: Firestore DB ID =", config.firestoreDatabaseId || "(default)");
    
    // Explicitly check for configuration issues
    if (!config.apiKey || config.apiKey === "MY_GEMINI_API_KEY") {
      console.error("Firebase API Key is missing or invalid placeholder.");
    }
    
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection: ONLINE");
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("Firebase connection check: Client is offline. Firestore is not reachable.");
    } else {
      console.warn("Firestore connection check failed (expected if path is secured):", error.message);
    }
  }
}
testConnection();
