import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
const e = import.meta.env
const cfg = { apiKey:e.VITE_FIREBASE_API_KEY, authDomain:e.VITE_FIREBASE_AUTH_DOMAIN, projectId:e.VITE_FIREBASE_PROJECT_ID,
  storageBucket:e.VITE_FIREBASE_STORAGE_BUCKET, messagingSenderId:e.VITE_FIREBASE_MESSAGING_SENDER_ID, appId:e.VITE_FIREBASE_APP_ID }
export const firebaseConfigured = Boolean(cfg.apiKey && cfg.projectId)
const app = firebaseConfigured ? initializeApp(cfg) : null
export const auth = app && getAuth(app)
export const db = app && getFirestore(app)
