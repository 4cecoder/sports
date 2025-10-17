import { SignUpForm } from "@/components/sign-up-form";
import { AuthBackground } from "@/components/auth-background";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Fastbreak account to start managing sports events.',
};

export default function Page() {
  return (
    <>
      <AuthBackground />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </>
  );
}
