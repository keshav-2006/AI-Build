import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCdn0y1uzgT94iu_IWxipJDrvlVoqBcxjc",
  authDomain: "ai-build-bc045.firebaseapp.com",
  projectId: "ai-build-bc045",
  storageBucket: "ai-build-bc045.firebasestorage.app",
  messagingSenderId: "839026716333",
  appId: "1:839026716333:web:24e7bf1167e7a34d45a024",
  measurementId: "G-PNEV1DNNS3",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }

