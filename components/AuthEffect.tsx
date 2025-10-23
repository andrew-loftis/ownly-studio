"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";

export default function AuthEffect() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
