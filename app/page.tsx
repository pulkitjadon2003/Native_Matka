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

    if (authLoading) return <div className="flex h-screen items-center justify-center bg-background-dark text-white"><div className="animate-pulse flex flex-col items-center"><span className="material-symbols-outlined text-4xl text-primary mb-4 icon-filled">casino</span><p className="tracking-widest text-sm text-text-secondary">LOADING SYSTEM...</p></div></div>;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="flex flex-col gap-8 max-w-7xl mx-auto">

                        {/* KPI Section */}
                        <section className="flex flex-col gap-6">
                            <div className="flex items-end justify-between border-b border-border-dark pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                        <span className="material-symbols-outlined text-primary">monitoring</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">System Metrics</h3>
                                        <p className="text-sm text-text-secondary mt-1">Real-time overview of the Matka platform</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-secondary bg-surface-dark px-4 py-2 rounded-full border border-border-dark">
                                    <span className="relative flex size-2 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                                        <span className="relative inline-flex rounded-full size-2 bg-success"></span>
                                    </span>
                                    LIVE DATA
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                                {/* Total Users */}
                                <Card className="p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-surface-dark border-border-dark hover:border-primary/50 shadow-lg hover:shadow-[0_10px_40px_-15px_rgba(212,175,55,0.4)]">
                                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                                    <div className="mb-6 flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Total Users</p>
                                            <p className="text-[10px] text-text-secondary">Registered Accounts</p>
                                        </div>
                                        <div className="p-2.5 bg-background-dark rounded-xl border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                                            <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">group</span>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between z-10 mt-auto">
                                        <h4 className="text-4xl font-black text-white tracking-tight">{stats.totalUsers}</h4>
                                        <span className="mb-1 flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">
                                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                            +12%
                                        </span>
                                    </div>
                                </Card>

                                {/* Active Users */}
                                <Card className="p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-surface-dark border-border-dark hover:border-blue-500/50 shadow-lg hover:shadow-[0_10px_40px_-15px_rgba(59,130,246,0.3)]">
                                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                                    <div className="mb-6 flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Active Now</p>
                                            <p className="text-[10px] text-text-secondary">Currently Online</p>
                                        </div>
                                        <div className="p-2.5 bg-background-dark rounded-xl border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                                            <span className="material-symbols-outlined text-text-secondary group-hover:text-blue-400 transition-colors">wifi</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col z-10 mt-auto">
                                        <div className="flex items-end justify-between mb-3">
                                            <h4 className="text-4xl font-black text-white tracking-tight">{stats.activeUsers}</h4>
                                            <div className="relative flex size-3 mb-2 mr-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-background-dark overflow-hidden relative">
                                            <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Total Bets */}
                                <Card className="p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-surface-dark border-border-dark hover:border-purple-500/50 shadow-lg hover:shadow-[0_10px_40px_-15px_rgba(168,85,247,0.3)]">
                                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                                    <div className="mb-6 flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Today's Bets</p>
                                            <p className="text-[10px] text-text-secondary">Total Slips Created</p>
                                        </div>
                                        <div className="p-2.5 bg-background-dark rounded-xl border border-white/5 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                                            <span className="material-symbols-outlined text-text-secondary group-hover:text-purple-400 transition-colors">receipt_long</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col z-10 mt-auto">
                                        <h4 className="text-4xl font-black text-white tracking-tight mb-2">{stats.totalBets}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Across all markets</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Revenue */}
                                <Card className="p-6 flex flex-col relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br from-surface-dark to-background-dark border-border-dark hover:border-success/50 shadow-lg hover:shadow-[0_10px_40px_-15px_rgba(34,197,94,0.3)]">
                                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-success/10 blur-3xl group-hover:bg-success/20 transition-all duration-500"></div>
                                    <div className="mb-6 flex items-center justify-between z-10">
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Total Revenue</p>
                                            <p className="text-[10px] text-text-secondary">Today's Profit</p>
                                        </div>
                                        <div className="p-2.5 bg-background-dark rounded-xl border border-white/5 group-hover:bg-success/10 group-hover:border-success/30 transition-colors">
                                            <span className="material-symbols-outlined text-text-secondary group-hover:text-success transition-colors">account_balance_wallet</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col z-10 mt-auto">
                                        <h4 className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
                                            <span className="text-2xl text-success font-bold">₹</span>
                                            {stats.totalRevenue.toLocaleString('en-IN')}
                                        </h4>
                                        <p className="text-[10px] font-medium text-text-secondary mt-2 text-right">Updated 1 min ago</p>
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* Recent Activity (Placeholder) */}
                        <section className="flex flex-col gap-6 mt-4">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-4">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                    <span className="material-symbols-outlined text-text-primary">history</span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Recent Live Activity</h3>
                            </div>
                            <Card className="p-0 overflow-hidden bg-surface-dark border-border-dark shadow-xl">
                                <div className="flex flex-col items-center justify-center py-24 text-text-secondary relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
                                    <div className="p-4 bg-background-dark rounded-full mb-4 border border-white/5">
                                        <span className="material-symbols-outlined text-3xl opacity-50">data_alert</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-1">No Recent Activity</h4>
                                    <p className="text-sm">Activity charts and live feed tables will go here.</p>
                                </div>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
