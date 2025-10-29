"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/lib/authStore";
import Button from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function AuthModal() {
  const { modalOpen, mode, loading, error, closeModal, signIn, signUp, signInWithGoogle } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!modalOpen) return null;

  const onSubmit = async (data: FormValues) => {
    if (mode === "signin") {
      await signIn(data.email, data.password);
    } else {
      await signUp(data.email, data.password);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative glass-strong rounded-2xl w-full max-w-sm p-6 mx-4">
        <h3 className="text-xl font-semibold text-[var(--txt)] mb-4">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h3>
        <div className="space-y-3 mb-4">
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[var(--txt)] hover:border-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4" aria-hidden>
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.202 6.053 28.791 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.39 15.108 18.83 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.202 6.053 28.791 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.152 0 9.8-1.977 13.293-5.197l-6.154-5.205C29.065 35.091 26.641 36 24 36c-5.202 0-9.646-3.317-11.307-7.952l-6.55 5.047C9.458 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.02 12.02 0 01-4.115 5.522l.003-.002 6.154 5.205C36.907 39.2 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="flex items-center gap-3 text-[var(--muted)] text-xs">
            <div className="h-px bg-white/10 flex-1" />
            <span>or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-[var(--txt)] outline-none focus:border-white/20"
              placeholder="you@domain.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-[var(--txt)] outline-none focus:border-white/20"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button disabled={loading} variant="primary" className="w-full">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-[var(--muted)]">
          {mode === "signin" ? (
            <button
              className="underline underline-offset-4 hover:text-[var(--txt)]"
              onClick={() => useAuthStore.setState({ mode: "signup" })}
            >
              Need an account? Sign up
            </button>
          ) : (
            <button
              className="underline underline-offset-4 hover:text-[var(--txt)]"
              onClick={() => useAuthStore.setState({ mode: "signin" })}
            >
              Have an account? Sign in
            </button>
          )}
        </div>
        <button
          className="absolute top-3 right-3 text-[var(--muted)] hover:text-[var(--txt)]"
          onClick={closeModal}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
