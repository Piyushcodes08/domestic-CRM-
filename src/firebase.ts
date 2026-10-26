import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyBtUweXCTobm3Sny2NZ9afnRPj9_J-91SI',
  authDomain: 'domestic-crm-2d591.firebaseapp.com',
  projectId: 'domestic-crm-2d591',
  storageBucket: 'domestic-crm-2d591.firebasestorage.app',
  messagingSenderId: '107028405020',
  appId: '1:107028405020:web:9303675ef19c00562ab8d9',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
