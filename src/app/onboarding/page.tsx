import { UserIcon } from "lucide-react";
import OnboardingCard from "./_components/OnboardingCard";
import { Role } from "./types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

export default async function Onboarding() {
  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center px-1">
      <Card className="w-md">
        <CardHeader>
          <CardTitle>Welcome to Taska</CardTitle>
          <CardDescription>Choose a demo user to explore the platform. Each role has different permissions and features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {
              roles.map((role) => (
                <OnboardingCard key={role.value} role={role} />
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}