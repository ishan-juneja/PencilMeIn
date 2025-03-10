import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDiTocuzVebANRRgPOTEr_DV2hSwkUwRIU",
    authDomain: "pencilmein-e7ac3.firebaseapp.com",
    projectId: "pencilmein-e7ac3",
    storageBucket: "pencilmein-e7ac3.firebasestorage.app",
    messagingSenderId: "781971448840",
    appId: "1:781971448840:web:3a6136afaa68249d4a1dbd",
    measurementId: "G-HTYNH95JLW"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore();

export default db;