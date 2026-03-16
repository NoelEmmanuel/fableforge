import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default async function SignUpPage() {
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
          Create your account
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Start building your story bibles and chapters.
        </p>
        <SignUpForm />
        <p className="mt-4 text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-indigo-400 underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

