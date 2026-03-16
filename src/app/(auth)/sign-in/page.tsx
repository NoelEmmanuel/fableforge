import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/books");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-semibold">Sign in to FableForge</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Continue your stories, specs, and chapters.
        </p>
        <SignInForm />
        <p className="mt-4 text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-zinc-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

