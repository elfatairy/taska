import { UserIcon } from "lucide-react";
import OnboardingCard from "@/features/auth/components/OnboardingCard";
import { Role } from "@/features/auth/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const roles: Role[] = [
  {
    label: "CTO",
    value: "CTO" as const,
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
  },
  {
    label: "Product Manager",
    value: "Product Manager" as const,
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
    locked: true,
  },
  {
    label: "Team Lead",
    value: "Team Lead" as const,
    icon: <UserIcon className="size-6 sm:size-10" aria-hidden />,
    locked: true,
  },
  {
    label: "Developer",
    value: "Developer" as const,
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