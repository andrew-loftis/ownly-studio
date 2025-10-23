"use client";

import { create } from "zustand";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

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
    if (!auth) throw new Error("Firebase not configured");
    set({ loading: true, error: undefined });
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      set({ user: res.user, modalOpen: false });
    } catch (e: any) {
      set({ error: e?.message ?? "Sign-in failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password) => {
    if (!auth) throw new Error("Firebase not configured");
    set({ loading: true, error: undefined });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: res.user, modalOpen: false });
    } catch (e: any) {
      set({ error: e?.message ?? "Sign-up failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    if (!auth) return;
    await signOut(auth);
    set({ user: null });
  },
  init: () => {
    const { initialized } = get();
    if (initialized) return;
    if (!auth) return; // no-op if not configured
    onAuthStateChanged(auth, (u) => set({ user: u, initialized: true }));
  },
}));
