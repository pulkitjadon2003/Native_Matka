"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // We don't use useAuth here for protection, but we could use it for redirect if already logged in
    // For simplicity, just manual login logic here

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, password, is_admin_login: true }),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-dark p-4">
            <Card className="w-full max-w-md p-8 space-y-6 bg-surface-dark border-border-dark">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
                        <span className="material-symbols-outlined icon-filled text-2xl">lock</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Login</h1>
                    <p className="text-sm text-text-secondary">Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                            id="mobile"
                            placeholder="Enter mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-error text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
