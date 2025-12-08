'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAccountAction } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { useSignIn } from "@clerk/nextjs";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { tryCatch } from "@/lib/try-catch";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { Role } from "../types";

export default function OnboardingCard({ role }: { role: Role }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const loginWithRole = useAccountAction(api.auth.loginWithRole);
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();

  const handleRoleClick = async (role: Role) => {
    if (!isLoaded) {
      toast.error("Authentication not ready. Please try again.");
      return;
    }

    if (role.locked) {
      toast.info("This role is still under development, check back later to use it");
      return;
    }

    startTransition(async () => {
      try {
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
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    });
  }

  return (
    <Button
      className={cn(
        "relative flex-1 p-10 aspect-1 cursor-pointer ring-2 ring-transparent flex-col h-auto",
        !role.locked && "hover:ring-primary",
        role.locked && "opacity-50"
      )}
      variant="outline"
      onClick={() => handleRoleClick(role)}
      disabled={isPending || !isLoaded}
      key={role.value}
    >
      {role.icon}
      <span className="text-sm sm:text-lg text-wrap">
        {isPending ? "Loading..." : role.label}
      </span>
      {role.locked && (
        <Icon 
          icon="DoubleGear" 
          className="absolute top-2 left-2 sm:size-6 size-5" 
          aria-label="Coming soon" 
        />
      )}
    </Button>
  )
}