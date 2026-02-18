"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth(true); // Require Admin
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalBets: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/admin/stats", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (authLoading) return <div className="flex h-screen items-center justify-center bg-background-dark text-white">Loading...</div>;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="flex flex-col gap-6">

                        {/* KPI Section */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="material-symbols-outlined text-primary">monitoring</span>
                                <h3 className="text-lg font-bold text-white">Dashboard Overview</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                                {/* Total Users */}
                                <Card className="p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all"></div>
                                    <div className="mb-4 flex items-center justify-between z-10">
                                        <p className="text-sm font-medium text-text-secondary">Total Users</p>
                                        <span className="material-symbols-outlined text-text-secondary text-xl">group</span>
                                    </div>
                                    <div className="flex items-end gap-2 z-10">
                                        <h4 className="text-3xl font-bold text-white">{stats.totalUsers}</h4>
                                        <span className="mb-1 flex items-center text-xs font-medium text-success bg-success/10 px-1.5 rounded">
                                            <span className="material-symbols-outlined text-sm">trending_up</span>
                                            +12%
                                        </span>
                                    </div>
                                </Card>

                                {/* Active Users */}
                                <Card className="p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all"></div>
                                    <div className="mb-4 flex items-center justify-between z-10">
                                        <p className="text-sm font-medium text-primary">Active Users</p>
                                        <div className="relative flex size-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-2 z-10">
                                        <h4 className="text-3xl font-bold text-white">{stats.activeUsers}</h4>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
                                        <div className="h-1.5 w-3/4 rounded-full bg-primary"></div>
                                    </div>
                                    <p className="mt-2 text-xs text-text-secondary">Currently online</p>
                                </Card>

                                {/* Total Bets */}
                                <Card className="p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                                    <div className="mb-4 flex items-center justify-between z-10">
                                        <p className="text-sm font-medium text-text-secondary">Total Bets Today</p>
                                        <span className="material-symbols-outlined text-text-secondary text-xl">casino</span>
                                    </div>
                                    <div className="flex items-end gap-2 z-10">
                                        <h4 className="text-3xl font-bold text-white">{stats.totalBets}</h4>
                                    </div>
                                </Card>

                                {/* Revenue */}
                                <Card className="p-5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-success/5 blur-2xl group-hover:bg-success/10 transition-all"></div>
                                    <div className="mb-4 flex items-center justify-between z-10">
                                        <p className="text-sm font-medium text-text-secondary">Revenue Today</p>
                                        <span className="material-symbols-outlined text-text-secondary text-xl">payments</span>
                                    </div>
                                    <div className="flex items-end gap-2 z-10">
                                        <h4 className="text-3xl font-bold text-white">₹ {stats.totalRevenue}</h4>
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* Recent Activity (Placeholder) */}
                        <section className="flex flex-col gap-4 mt-4">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                            </div>
                            <Card className="p-0 overflow-hidden">
                                <div className="p-8 text-center text-text-secondary">
                                    Activity chart and tables will go here.
                                </div>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
