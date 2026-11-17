import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
export const subscribeTransactions = (uid, cb, onErr) =>
  onSnapshot(query(collection(db,'transactions'), where('userId','==',uid)),
    s => cb(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.date.localeCompare(a.date))), onErr)
export const addTransaction = (uid, t) => addDoc(collection(db,'transactions'), { ...t, amount: Number(t.amount), userId: uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
export const updateTransaction = (id, uid, t) => updateDoc(doc(db,'transactions',id), { ...t, amount: Number(t.amount), userId: uid, updatedAt: serverTimestamp() })
export const deleteTransaction = (id) => deleteDoc(doc(db,'transactions',id))
