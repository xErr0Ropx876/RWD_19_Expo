import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let storage: FirebaseStorage

if (typeof window !== 'undefined') {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    storage = getStorage(app)
}

export async function uploadFile(file: File, path: string): Promise<string> {
    if (!storage) {
        throw new Error('Firebase storage not initialized')
    }

    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
}

export async function deleteFile(fileUrl: string): Promise<void> {
    if (!storage) {
        throw new Error('Firebase storage not initialized')
    }

    try {
        const fileRef = ref(storage, fileUrl)
        await deleteObject(fileRef)
    } catch (error) {
        console.error('Error deleting file:', error)
        throw error
    }
}

export { storage }
