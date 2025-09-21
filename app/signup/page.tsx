import { SignUpForm } from "@/components/signup-form"
import { Suspense } from "react"

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignUpForm />
                </Suspense>
            </div>
        </div>
    )
}
