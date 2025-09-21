import { SignInForm } from "@/components/signin-form"
import { Suspense } from "react"

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignInForm />
                </Suspense>
            </div>
        </div>
    )
}
