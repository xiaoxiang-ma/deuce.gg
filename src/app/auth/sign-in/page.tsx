import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md",
          },
        }}
        routing="path"
        path="/auth/sign-in"
        afterSignInUrl="/dashboard"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 