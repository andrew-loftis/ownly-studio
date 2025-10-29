"use client";

import { create } from "zustand";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ensureUserDoc } from "./user";

type Mode = "signin" | "signup";

type AuthState = {
  user: User | null;
  loading: boolean;
  modalOpen: boolean;
  mode: Mode;
  error?: string;
  initialized: boolean;
  openModal: (mode?: Mode) => void;
  closeModal: () => void;
  setUser: (u: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  init: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  modalOpen: false,
  mode: "signin",
  initialized: false,
  openModal: (mode = "signin") => set({ modalOpen: true, mode, error: undefined }),
  closeModal: () => set({ modalOpen: false, error: undefined }),
  setUser: (u) => set({ user: u }),
  signIn: async (email, password) => {
    // Guard: if Firebase isn't initialized (likely missing envs in prod), surface a friendly error
    if (!auth) {
      set({ error: "Authentication is not configured. Please try again shortly.", loading: false });
      return;
    }
    set({ loading: true, error: undefined });
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      try {
        await ensureUserDoc(res.user);
      } catch {
        // non-fatal
      }
      set({ user: res.user, modalOpen: false });
    } catch (e: any) {
      // Map common Firebase auth codes to friendlier messages
      const code = e?.code as string | undefined;
      const msg =
        code === "auth/invalid-credential" || code === "auth/invalid-login-credentials"
          ? "Invalid email or password."
          : code === "auth/too-many-requests"
          ? "Too many attempts. Please wait and try again."
          : e?.message ?? "Sign-in failed";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password) => {
    if (!auth) {
      set({ error: "Authentication is not configured. Please try again shortly.", loading: false });
      return;
    }
    set({ loading: true, error: undefined });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await ensureUserDoc(res.user);
      } catch {
        // non-fatal
      }
      set({ user: res.user, modalOpen: false });
    } catch (e: any) {
      const code = e?.code as string | undefined;
      const msg =
        code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : code === "auth/weak-password"
          ? "Password should be at least 6 characters."
          : code === "auth/operation-not-allowed"
          ? "Email/password sign-up is disabled."
          : e?.message ?? "Sign-up failed";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    if (!auth) return;
    await signOut(auth);
    set({ user: null });
  },
  signInWithGoogle: async () => {
    if (!auth) {
      set({ error: "Authentication is not configured. Please try again shortly.", loading: false });
      return;
    }
    set({ loading: true, error: undefined });
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      try {
        await ensureUserDoc(res.user);
      } catch {
        // non-fatal
      }
      set({ user: res.user, modalOpen: false });
    } catch (e: any) {
      const code = e?.code as string | undefined;
      const msg =
        code === "auth/popup-closed-by-user"
          ? "Sign-in popup was closed before completing."
          : code === "auth/cancelled-popup-request"
          ? "Another sign-in request was cancelled. Try again."
          : e?.message ?? "Google sign-in failed";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },
  init: () => {
    const { initialized } = get();
    if (initialized) return;
    if (!auth) return; // no-op if not configured
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          await ensureUserDoc(u);
        } catch {
          // non-fatal
        }
      }
      set({ user: u, initialized: true });
    });
  },
}));
