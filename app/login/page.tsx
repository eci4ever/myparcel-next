import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Button variant="secondary" className="mb-6 px-7 flex items-center" asChild>
          <Link href={"/"}> Home</Link>
        </Button>
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
