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
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-lg ring-1 ring-slate-800">
        <h1 className="mb-2 text-2xl font-semibold text-slate-50">
          Sign in to FableForge
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Continue your stories, specs, and chapters.
        </p>
        <SignInForm />
        <p className="mt-4 text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-indigo-400 underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

