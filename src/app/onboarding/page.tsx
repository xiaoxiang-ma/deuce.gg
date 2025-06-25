import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Profile</h1>
        <OnboardingForm userId={userId} />
      </div>
    </div>
  );
} 