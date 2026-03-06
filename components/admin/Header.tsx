"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { menuItems } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
    const pathname = usePathname();
    const { logout } = useAuth(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu when routing changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const pageTitle = pathname === "/" ? "Dashboard Overview" : pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border-dark bg-background-dark/80 px-4 md:px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-background-dark/60 gap-4">
            <div className="flex items-center gap-3 md:gap-0">
                <button
                    className="lg:hidden relative flex size-10 items-center justify-center rounded-xl bg-surface-dark border border-border-dark text-white hover:text-primary transition-colors focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">{isMobileMenuOpen ? "close" : "menu"}</span>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight truncate max-w-[150px] sm:max-w-none">{pageTitle}</h2>
                    <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-text-secondary mt-1 uppercase tracking-wider">
                        <span className="hover:text-primary cursor-pointer transition-colors">Admin Portal</span>
                        <span className="text-primary/50 text-[10px]">●</span>
                        <span className="text-primary font-bold">{pageTitle}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <button className="relative flex size-10 items-center justify-center rounded-full bg-surface-dark border border-border-dark text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-error ring-2 ring-surface-dark animate-pulse"></span>
                </button>
                <div className="h-8 w-[1px] bg-border-dark"></div>
                <button className="hidden sm:flex items-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">help</span>
                    Support
                </button>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-20 z-40 bg-background-dark/95 backdrop-blur-3xl lg:hidden flex flex-col h-[calc(100vh-80px)] overflow-y-auto border-t border-white/5">
                    <nav className="flex-1 px-4 py-6 scrollbar-hide">
                        <div className="flex flex-col gap-1.5">
                            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-text-secondary/70">Main Menu</p>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "group relative flex items-center gap-4 rounded-xl px-4 py-4 text-base font-bold transition-all duration-300",
                                            isActive
                                                ? "bg-gradient-to-r from-primary/20 to-transparent text-primary shadow-sm"
                                                : "text-text-secondary hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                        )}
                                        <span className={cn(
                                            "material-symbols-outlined text-[24px] transition-transform duration-300",
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

                    <div className="border-t border-border-dark p-4 bg-surface-dark/50 mt-auto">
                        <div
                            className="flex items-center justify-between gap-2 rounded-xl bg-surface-dark border border-white/5 p-4 active:bg-white/10 transition-colors"
                            onClick={() => logout()}
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px]">
                                    <div className="size-full rounded-full bg-surface-dark flex items-center justify-center text-white font-bold text-xl">
                                        A
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-base font-bold text-white transition-colors">Sign Out</p>
                                    <p className="text-xs text-text-secondary">Admin Access</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-error text-[24px]">logout</span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
