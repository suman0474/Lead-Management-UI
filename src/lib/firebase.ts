// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB0nlRTR3bdHqut3Vz8XS5xMzyjhnR17Wo",
  authDomain: "leadmanagement-e2482.firebaseapp.com",
  projectId: "leadmanagement-e2482",
  storageBucket: "leadmanagement-e2482.firebasestorage.app",
  messagingSenderId: "842374431466",
  appId: "1:842374431466:web:66985b8a40cff9b4758d93",
  measurementId: "G-GW95ZH98XK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});
export { auth, provider };
