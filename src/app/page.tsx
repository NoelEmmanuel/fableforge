export default function Home() {
  return (
    // For now, keep the default starter page. In a later step we will
    // redirect based on auth state (to /books or /sign-in).
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-700">
        FableForge is initializing. Visit <code>/sign-in</code> to get started.
      </p>
    </div>
  );
}
