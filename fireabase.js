import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDyoKoYeoAkU2Hfy16YN9VSw6zkiY4xSYk",
    authDomain: "cabocos-bar.firebaseapp.com",
    projectId: "cabocos-bar",
    storageBucket: "cabocos-bar.firebasestorage.app",
    messagingSenderId: "93546509581",
    appId: "1:93546509581:web:fb18230e5366f84bf12c44",
    measurementId: "G-S3QLXXB6EJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs, onSnapshot, orderBy, query };