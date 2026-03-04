"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "analytics", label: "Betting Status", href: "/bids/status" },
    { icon: "storefront", label: "Market Settings", href: "/markets" },
    { icon: "group", label: "User Management", href: "/users" },
    { icon: "inventory_2", label: "Pending Deposits", href: "/deposits" },
    { icon: "account_balance", label: "Pending Withdrawals", href: "/withdrawals" },
    { icon: "description", label: "Reports", href: "/reports" },
    { icon: "settings", label: "App Settings", href: "/settings/app" },
    { icon: "currency_rupee", label: "Game Rates", href: "/settings/rates" },
    { icon: "payments", label: "Payment Settings", href: "/settings/payment" },
    { icon: "branding_watermark", label: "Branding", href: "/settings/branding" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth(false);

    return (
        <aside className="hidden w-72 flex-col border-r border-border-dark bg-surface-dark lg:flex shadow-2xl">
            <div className="flex h-20 items-center gap-3 px-6 py-4 border-b border-border-dark bg-background-dark/50">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary/20 text-primary shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <span className="material-symbols-outlined icon-filled text-2xl text-white">casino</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide text-white">MATKA <span className="text-primary font-black">ADMIN</span></h1>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Premium System</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
                <div className="flex flex-col gap-1.5">
                    <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-text-secondary/70">Main Menu</p>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-primary/20 to-transparent text-primary shadow-sm"
                                        : "text-text-secondary hover:bg-white/5 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                )}
                                <span className={cn(
                                    "material-symbols-outlined text-[22px] transition-transform duration-300",
                                    isActive ? "icon-filled scale-110" : "group-hover:scale-110"
                                )}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-border-dark p-4 bg-background-dark/30">
                <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-dark border border-white/5 p-3 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px]">
                            <div className="size-full rounded-full bg-surface-dark flex items-center justify-center text-white font-bold text-lg">
                                A
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Admin</p>
                            <p className="text-[10px] text-text-secondary">Super Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            logout();
                        }}
                        className="text-text-secondary hover:text-error transition-all p-2 rounded-full hover:bg-error/10"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-[22px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
