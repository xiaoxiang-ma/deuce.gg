import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md",
          },
        }}
        afterSignUpUrl="/onboarding"
        signInUrl="/auth/sign-in"
      />
    </div>
  );
} 