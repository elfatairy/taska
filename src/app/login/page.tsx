import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LoginPage() {  
  return (
    <div>
      <h1>Login</h1>
      <Button asChild>
        <Link href="/onboarding">
          Login With Role
        </Link>
      </Button>
    </div>
  )
}