import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
export const subscribe = (col, uid, cb, onErr) => onSnapshot(query(collection(db,col), where('userId','==',uid)),
  s => cb(s.docs.map(d => ({ id:d.id, ...d.data() }))), onErr)
export const create = (col, uid, data) => addDoc(collection(db,col), { ...data, userId:uid, createdAt:serverTimestamp(), updatedAt:serverTimestamp() })
export const upsert = (col, id, uid, data) => setDoc(doc(db,col,id), { ...data, userId:uid, updatedAt:serverTimestamp() }, { merge:true })
export const patch = (col, id, uid, data) => updateDoc(doc(db,col,id), { ...data, userId:uid, updatedAt:serverTimestamp() })
export const remove = (col, id) => deleteDoc(doc(db,col,id))
