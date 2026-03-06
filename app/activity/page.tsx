"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function ActivityFeedPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/activity', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setActivities(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
        // Option: set up a polling interval for "live" feel
        const interval = setInterval(fetchActivity, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'bid_placed': return { icon: 'casino', color: 'text-primary', bg: 'bg-primary/10' };
            case 'deposit_request': return { icon: 'arrow_downward', color: 'text-success', bg: 'bg-success/10' };
            case 'withdrawal_request': return { icon: 'arrow_upward', color: 'text-error', bg: 'bg-error/10' };
            default: return { icon: 'notifications', color: 'text-white', bg: 'bg-white/10' };
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;

        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;

        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="space-y-2 z-10">
                                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-4xl">dynamic_feed</span>
                                    Live Activity
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Real-time chronological feed of user bets and transactions.</p>
                            </div>
                            <div className="flex items-center gap-3 z-10">
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold tracking-widest uppercase">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                                    Live Updates
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={fetchActivity}
                                    className="h-10 w-10 p-0 rounded-xl border border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary transition-all text-white"
                                    title="Manual Refresh"
                                >
                                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                                </Button>
                            </div>
                        </div>

                        {/* Feed Section */}
                        {loading && activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                <span className="text-sm font-medium text-text-secondary tracking-widest uppercase">LOADING FEED...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <Card className="p-16 text-center bg-surface-dark border-dashed border-border-dark shadow-xl rounded-2xl flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-border-dark text-6xl mb-4">snooze</span>
                                <h3 className="text-xl font-bold text-white mb-2">No recent activity</h3>
                                <p className="text-sm text-text-secondary">The platform is quiet right now.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-dark before:to-transparent">
                                {activities.map((item, index) => {
                                    const ui = getActivityIcon(item.type);

                                    return (
                                        <div key={item._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>

                                            {/* Icon Marker */}
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background-dark ${ui.bg} absolute left-0 md:left-1/2 -translate-x-1/2 z-10 shadow-lg`}>
                                                <span className={`material-symbols-outlined text-[18px] ${ui.color}`}>{ui.icon}</span>
                                            </div>

                                            {/* Content Card */}
                                            <Card className={`w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 p-4 bg-surface-dark border-border-dark rounded-2xl shadow-lg hover:border-primary/30 transition-colors group-hover:scale-[1.02] duration-300`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.user?.name || 'Unknown User'}</span>
                                                        <span className="text-[10px] text-text-secondary mt-0.5">{item.user?.mobile || 'N/A'}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-text-secondary bg-background-dark px-2 py-1 rounded-md border border-white/5">
                                                        {formatTimestamp(item.timestamp)}
                                                    </span>
                                                </div>

                                                {item.entity === 'transaction' ? (
                                                    <div className="flex items-center gap-3 bg-background-dark p-3 rounded-xl border border-white/5">
                                                        <div className="flex flex-col flex-1 gap-1">
                                                            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                                                                {item.type.replace('_', ' ')}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={`text-[9px] uppercase font-bold px-1.5 py-0 border-white/10 ${item.status === 'success' ? 'text-success/80' : item.status === 'pending' ? 'text-warning/80' : 'text-error/80'}`}>
                                                                    {item.status}
                                                                </Badge>
                                                                {item.payment_method && (
                                                                    <span className="text-xs text-text-secondary font-medium">{item.payment_method}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`text-lg font-black tracking-wider ${ui.color}`}>
                                                            ₹{item.amount}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                        <div className="flex flex-col flex-1 gap-1">
                                                            <span className="text-[11px] font-bold text-primary tracking-wide">
                                                                {item.market_name}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-white font-medium capitalize">
                                                                    {item.bid_type.replace('_', ' ')}
                                                                </span>
                                                                <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-primary/20 bg-primary/10 text-primary">
                                                                    {item.session}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-lg font-black font-mono text-white tracking-widest bg-background-dark px-2 py-0.5 rounded border border-white/10">
                                                                {item.digit}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-text-secondary uppercase">
                                                                ₹{item.amount} PTS
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
