import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBCzxE4SbUwokxVt-Pi5IJE_JJPrYmYPbk',
  authDomain: 'mindmap-c7d8f.firebaseapp.com',
  projectId: 'mindmap-c7d8f',
  storageBucket: 'mindmap-c7d8f.appspot.com',
  messagingSenderId: '510149345910',
  appId: '1:510149345910:web:4269f27a4d062681b45557',
  measurementId: 'G-D31613VKNJ',
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
// TODO
//   db.settings({
//     timestampsInSnapshots: true,
//   });
