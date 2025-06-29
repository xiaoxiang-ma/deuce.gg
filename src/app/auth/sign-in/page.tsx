import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        redirectUrl={searchParams.redirect_url || "/dashboard"}
        afterSignInUrl={searchParams.redirect_url || "/dashboard"}
        routing="path"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 