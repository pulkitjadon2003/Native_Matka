"use client";

import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const pageTitle = pathname === "/" ? "Dashboard Overview" : pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border-dark bg-background-dark/60 px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-background-dark/40">
            <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white tracking-tight">{pageTitle}</h2>
                <div className="flex items-center gap-2 text-[11px] font-medium text-text-secondary mt-1 uppercase tracking-wider">
                    <span className="hover:text-primary cursor-pointer transition-colors">Admin Portal</span>
                    <span className="text-primary/50 text-[10px]">●</span>
                    <span className="text-primary font-bold">{pageTitle}</span>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <button className="relative flex size-10 items-center justify-center rounded-full bg-surface-dark border border-border-dark text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-error ring-2 ring-surface-dark animate-pulse"></span>
                </button>
                <div className="h-8 w-[1px] bg-border-dark"></div>
                <button className="flex items-center gap-2 text-sm font-semibold text-white hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">help</span>
                    Support
                </button>
            </div>
        </header>
    );
}
