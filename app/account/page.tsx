"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { userIsAnyOrgAdmin } from "@/lib/roles";

export default function AccountIndexPage() {
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      if (!user) {
        openModal("signin");
        return;
      }
      const isAdmin = await userIsAnyOrgAdmin(user.uid);
      router.replace(isAdmin ? "/account/admin" : "/account/client");
    };
    run();
  }, [user]);

  return null;
}
