"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "storefront", label: "Market Settings", href: "/markets" },
    { icon: "group", label: "User Management", href: "/users" },
    { icon: "description", label: "Reports", href: "/reports" },
    { icon: "settings", label: "App Settings", href: "/settings/app" },
    { icon: "currency_rupee", label: "Game Rates", href: "/settings/rates" },
    { icon: "payments", label: "Payment Settings", href: "/settings/payment" },
    { icon: "branding_watermark", label: "Branding", href: "/settings/branding" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth(false); // Don't redirect if not logged in, just get utilities

    return (
        <aside className="hidden w-72 flex-col border-r border-border-dark bg-background-dark lg:flex">
            <div className="flex h-20 items-center gap-3 px-6 py-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined icon-filled text-2xl">casino</span>
                </div>
                <div>
                    <h1 className="font-bold leading-tight text-white">Matka Admin</h1>
                    <p className="text-xs text-text-secondary">System v2.4</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-1">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Main</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-text-secondary hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <span className={cn("material-symbols-outlined text-[20px]", isActive && "icon-filled")}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-border-dark p-4">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-dark p-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">A</div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-white">Admin</p>
                            <p className="text-[10px] text-text-secondary">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-text-secondary hover:text-error transition-colors p-2 rounded-full hover:bg-white/5"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
