"use client";

import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const pageTitle = pathname === "/" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border-dark bg-background-dark/80 px-8 backdrop-blur-md">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white">{pageTitle}</h2>
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                    <span>Home</span>
                    <span>/</span>
                    <span className="text-white">{pageTitle}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background-dark"></span>
                </button>
            </div>
        </header>
    );
}
