import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = auth();
  
  // If the user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // If not signed in, redirect to sign in
  redirect("/auth/sign-in");
} 