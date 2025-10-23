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
  const { modalOpen, mode, loading, error, closeModal, signIn, signUp } = useAuthStore();
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
