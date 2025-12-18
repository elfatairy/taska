import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoLoginPopup } from "@/features/auth/components/DemoLoginPopup";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="w-screen h-screen bg-background text-foreground flex flex-col items-center justify-center px-1">
        <Card className="w-md">
          <CardHeader>
            <CardTitle>Welcome to Taska</CardTitle>
            <CardDescription>Enter your email and password below to login to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>

      <DemoLoginPopup />
    </>
  )
}