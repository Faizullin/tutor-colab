import admin from 'firebase-admin';
import { getApps, initializeApp, ServiceAccount } from 'firebase-admin/app';

const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
};

if (!getApps().length) {
    initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const adminAuth = admin.auth();

export { adminAuth };