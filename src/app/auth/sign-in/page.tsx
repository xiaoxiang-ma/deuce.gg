import { SignIn } from "@clerk/nextjs";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignIn 
        redirectUrl={searchParams.redirect_url || "/dashboard"}
        afterSignInUrl={searchParams.redirect_url || "/dashboard"}
        signUpUrl="/auth/sign-up" 
      />
    </div>
  );
} 