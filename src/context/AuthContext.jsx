import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, firebaseConfigured } from '../firebase/config'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
const MSG = { 'auth/invalid-credential':'Incorrect email or password.', 'auth/email-already-in-use':'An account with this email already exists.',
  'auth/weak-password':'Password must be at least 6 characters.', 'auth/user-not-found':'No account found for this email.',
  'auth/too-many-requests':'Too many attempts. Try again later.', 'auth/invalid-email':'Enter a valid email address.' }
export const friendly = (e) => MSG[e.code] || 'Something went wrong. Please try again.'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseConfigured)
  useEffect(() => firebaseConfigured ? onAuthStateChanged(auth, u => { setUser(u); setLoading(false) }) : undefined, [])
  const register = async (name, email, password) => {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(u, { displayName: name })
    await setDoc(doc(db, 'users', u.uid), { uid: u.uid, name, email, currency: 'INR', createdAt: serverTimestamp() })
  }
  const value = { user, loading, register,
    login: (e,p) => signInWithEmailAndPassword(auth,e,p), logout: () => signOut(auth), resetPassword: (e) => sendPasswordResetEmail(auth,e) }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
