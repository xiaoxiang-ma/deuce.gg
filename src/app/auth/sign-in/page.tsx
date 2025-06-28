import { SignIn } from "@clerk/nextjs";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md",
          },
        }}
        redirectUrl={searchParams.redirect_url || "/dashboard"}
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 