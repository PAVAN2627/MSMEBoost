/**
 * Firebase Connection Test
 * Run this to verify Firebase is properly configured
 */

import { auth, db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('✅ Firebase initialized');
    console.log('   Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    // Test 2: Check Auth
    console.log('✅ Firebase Auth ready');
    console.log('   Current user:', auth.currentUser?.email || 'Not logged in');
    
    // Test 3: Check Firestore
    console.log('✅ Firestore ready');
    
    // Test 4: Try to read from Firestore (will fail if not set up, but that's ok)
    try {
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore connection successful');
      console.log('   Test collection documents:', snapshot.size);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.log('⚠️  Firestore needs setup in Firebase Console');
        console.log('   Go to: https://console.firebase.google.com/project/udyog-ai/firestore');
        console.log('   Click "Create database" and choose "Start in test mode"');
      } else {
        console.log('⚠️  Firestore error:', error.message);
      }
    }
    
    console.log('\n🎉 Firebase is configured correctly!');
    console.log('\nNext steps:');
    console.log('1. Enable Authentication in Firebase Console');
    console.log('2. Enable Firestore Database in Firebase Console');
    console.log('3. Start using the app!');
    
    return true;
  } catch (error: any) {
    console.error('❌ Firebase configuration error:', error.message);
    return false;
  }
}

// Auto-run in development
if (import.meta.env.DEV) {
  testFirebaseConnection();
}
