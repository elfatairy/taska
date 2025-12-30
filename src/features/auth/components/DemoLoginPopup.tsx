'use client';

import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { X, UserCog } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useAccountAction } from "@/features/account/useAccount";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { Role } from "../types";
import { cn, featureUnderDevelopment } from "@/lib/utils";
import { tryCatch } from "@/lib/try-catch";
import { isFailure } from "@convex/utils/types";

const roles: Role[] = [
  {
    label: "CTO",
    value: "CTO" as const
  },
  {
    label: "Product Manager",
    value: "Product Manager" as const,
  },
  {
    label: "Team Lead",
    value: "Team Lead" as const,
    locked: true,
  },
  {
    label: "Frontend Developer",
    value: "Frontend Developer" as const,
  }
]

export function DemoLoginPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setOpen(true);
    }, 2000);

    return () => {
      setOpen(false);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-[350px] animate-in fade-in slide-in-from-top-4 duration-500">
      <Card className="shadow-xl border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium">Demo Login with Role</CardTitle>
              <CardDescription className="text-xs">Choose a role to explore</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {roles.map((role) => (
            <DemoLoginButton key={role.value} role={role} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DemoLoginButton({ role }: { role: Role }) {
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
      featureUnderDevelopment();
      return;
    }

    startTransition(async () => {
      try {
        const loginWithRoleResult = await loginWithRole({
          role: role.value
        });

        if (isFailure(loginWithRoleResult)) {
          console.error(loginWithRoleResult.error);
          toast.error("Failed to login");
          return;
        }

        const { data: result, error } = await tryCatch(signIn.create({
          strategy: "ticket",
          ticket: loginWithRoleResult.data.token,
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
    <Button variant="outline" className={cn(role.locked && "opacity-50")} onClick={() => handleRoleClick(role)}>
      {isPending ? "Loading..." : role.label}
    </Button>
  );
}