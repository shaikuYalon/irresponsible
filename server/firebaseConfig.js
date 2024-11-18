// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const apiKey = process.env.FIERBASE_KEY
const firebaseConfig = {
    apiKey: `${apiKey}`,
    authDomain: "irresponsible-5aeb9.firebaseapp.com",
    projectId: "irresponsible-5aeb9",
    storageBucket: "irresponsible-5aeb9.firebasestorage.app",
    messagingSenderId: "923301759292",
    appId: "1:923301759292:web:7e3874dfe674d9a274b639",
    measurementId: "G-R65WL0K9CF"
  };

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
