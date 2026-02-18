"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuth(requireAdmin = true) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!token || !storedUser) {
                if (pathname !== "/login") {
                    router.push("/login");
                }
                setLoading(false);
                return;
            }

            try {
                const userData = JSON.parse(storedUser);
                if (requireAdmin && !userData.is_admin) {
                    // Not an admin, redirect or show error
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    if (pathname !== "/login") router.push("/login");
                    setLoading(false);
                    return;
                }

                setUser(userData);
            } catch (e) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                if (pathname !== "/login") router.push("/login");
            }
            setLoading(false);
        };

        checkAuth();
    }, [router, pathname, requireAdmin]);

    const login = (token: string, userData: any) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
    };

    return { user, loading, login, logout };
}
