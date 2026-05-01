import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, ChatSession, Message, MessageRole } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  async ensureUser(user: { uid: string; email: string | null; displayName: string | null }): Promise<UserProfile> {
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          memory: '',
          lastMemoryUpdate: Date.now(),
        };
        await setDoc(userRef, newUser);
        return newUser;
      }
      return userSnap.data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      throw error;
    }
  },

  async updateMemory(uid: string, newMemory: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        memory: newMemory,
        lastMemoryUpdate: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createChat(userId: string, title: string): Promise<string> {
    const path = 'chats';
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        userId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async getChats(userId: string): Promise<ChatSession[]> {
    const path = 'chats';
    try {
      const q = query(
        collection(db, 'chats'), 
        where('userId', '==', userId), 
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  },

  async saveMessage(chatId: string, role: MessageRole, content: string): Promise<void> {
    const path = `chats/${chatId}/messages`;
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role,
        content,
        timestamp: Date.now(),
      });
      
      // Update chat session timestamp
      await updateDoc(doc(db, 'chats', chatId), {
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const path = `chats/${chatId}/messages`;
    const q = query(
      collection(db, 'chats', chatId, 'messages'), 
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  }
};
