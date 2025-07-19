// src/lib/signInWithGoogle.ts
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const token = await user.getIdToken();
    return { token, user };
  } catch (err) {
    throw err;
  }
};
