'use client';

import { useAccountAction } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { useSignIn } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { Role } from "../types";

export default function OnboardingCard({ role }: { role: Role }) {
  const loginWithRole = useAccountAction(api.auth.loginWithRole);
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();

  const handleRoleClick = async (role: Role) => {
    if (!isLoaded) return;

    if (role.locked) {
      toast.info("This role is still under development, check back later to use it");
      return;
    }

    const token = await loginWithRole({
      role: role.value
    });

    const { data: result, error } = await tryCatch(signIn.create({
      strategy: "ticket",
      ticket: token,
    }));

    if (error) {
      console.error(error);
      toast.error("Failed to login");
      return;
    }

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      redirect("/dashboard");
    }
  }

  return (
    <Button
      className={cn("relative flex-1 p-10 aspect-1 cursor-pointer ring-2 ring-transparent flex-col h-auto", !role.locked && "hover:ring-primary", role.locked && "opacity-50")}
      variant="outline"
      onClick={() => handleRoleClick(role)}
      key={role.value}
    >
      {role.icon}
      <span className="text-sm sm:text-lg text-wrap">{role.label}</span>
      {role.locked && <Icon icon="DoubleGear" className="absolute top-2 left-2 sm:size-6 size-5" aria-label="Coming soon" />}
    </Button>
  )
}