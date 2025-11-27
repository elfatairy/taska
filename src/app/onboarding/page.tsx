import { UserIcon } from "lucide-react";
import OnboardingCard from "./_components/OnboardingCard";
import { Role } from "./types";

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
  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center px-1">
      <div className="bg-card py-8 px-2 sm:px-8 rounded-lg border shadow-sm max-w-md">
        <h1 className="text-2xl font-bold text-center">Welcome to Taska</h1>
        <p className="text-sm text-center text-muted-foreground">Select a role</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-8">
          {
            roles.map((role) => (
              <OnboardingCard key={role.value} role={role} />
            ))
          }
        </div>
      </div>
    </div>
  );
}