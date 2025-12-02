import { Suspense } from "react"
import { Zap } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Zap className="h-6 w-6" />
                        </div>
                        <span className="font-display text-2xl font-bold">HackNexus</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="font-display text-5xl font-bold leading-tight">
                        Build your dream team and ship faster.
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Join thousands of hackers, designers, and builders. Find your next hackathon project, manage tasks, and get AI-powered mentorship.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm text-zinc-500">
                    <span>© 2024 HackNexus Inc.</span>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    )
}
