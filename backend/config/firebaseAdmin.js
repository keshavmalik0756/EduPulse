import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// You have two options here:
// Option 1: Provide the path to your service account key JSON file
// Option 2: Pass environment variables

try {
  // Option 1: Load from a local service account file (Create this file and add your JSON)
  const serviceAccountPath = path.resolve(__dirname, 'firebaseServiceAccount.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK initialized using local Service Account JSON");
  } else {
    // Option 2: Fallback to environment variables if the file doesn't exist
    // This requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace literal '\n' escaping with actual newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
      console.log("✅ Firebase Admin SDK initialized using Environment Variables");
    } else {
      console.warn("⚠️ Firebase Admin SDK not initialized: Missing serviceAccount config.");
    }
  }
} catch (error) {
  console.error("❌ Firebase Admin Initialization Error:", error);
}

export default admin;
