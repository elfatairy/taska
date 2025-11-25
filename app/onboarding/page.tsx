"use client";

import { UserIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/lib/try-catch";
import { cn } from "@/lib/utils";

type Role = {
  label: string;
  value: string;
  icon: React.ReactNode;
  locked?: boolean;
}

const roles: Role[] = [
  {
    label: "CTO",
    value: "CTO",
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
  },
  {
    label: "Product Manager",
    value: "Product Manager",
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
    locked: true,
  },
  {
    label: "Team Lead",
    value: "Team Lead",
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
    locked: true,
  },
  {
    label: "Developer",
    value: "Developer",
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
    locked: true,
  }
]

export default function Onboarding() {
  const handleRoleClick = (role: Role) => {
    if (role.locked) {
      toast.info("This role is still under development, check back later to use it");
      return;
    }

    // fetcher.submit({
    //   role: role.value,
    // }, {
    //   method: "post"
    // });
  }

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center px-1">
      <div className="bg-card py-8 px-2 sm:px-8 rounded-lg border shadow-sm max-w-md">
        <h1 className="text-2xl font-bold text-center">Welcome to Taska</h1>
        <p className="text-sm text-center text-muted-foreground">Select a role</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-8">
          {
            roles.map((role) => (
              <Button
                className={cn("relative flex-1 p-10 aspect-1 cursor-pointer ring-2 ring-transparent flex-col h-auto", !role.locked && "hover:ring-primary", role.locked && "opacity-50")}
                variant="outline"
                // disabled={fetcher.state !== "idle"}
                onClick={() => handleRoleClick(role)}
                key={role.value}
              >
                {role.icon}
                <span className="text-sm sm:text-lg text-wrap">{role.label}</span>
                {role.locked && <Icon icon="DoubleGear" className="absolute top-2 left-2 sm:size-6 size-5" aria-label="Coming soon" />}
              </Button>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export const clientAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const role = formData.get("role");

  if (!role) {
    return
  }

  // const { data: response, error } = await tryCatch(api.post<User>("/api/auth/login-with-role", {
  //   role
  // }));

  // if (error) {
  //   return toast.error("Failed to login");
  // }

  // const user = response.data;

  // localStorage.setItem("userId", user.id);
  // queryClient.setQueryData(userKeys.currentUser(), user);

  return redirect("/dashboard");
}