"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getISTDateString } from "@/lib/market";

interface BidDetail {
    user_id: string;
    user_name: string;
    user_phone: string;
    points: number;
    status: string;
    created_at: string;
}

interface BidGroup {
    bid_type: string;
    digit: string;
    session: string;
    total_points: number;
    bids: BidDetail[];
}

interface MarketStatus {
    game_id: string;
    game_name: string;
    market_total: number;
    types: BidGroup[];
}

export default function BettingStatusPage() {
    const { user, loading: authLoading } = useAuth(true);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MarketStatus[]>([]);
    const [selectedDate, setSelectedDate] = useState(getISTDateString());
    const [markets, setMarkets] = useState<any[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<string>("all");
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const fetchMarkets = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/markets", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setMarkets(json.data);
            }
        } catch (e) {
            console.error("Failed to fetch markets", e);
        }
    };

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = `/api/admin/bids/status?date=${selectedDate}`;
            if (selectedMarket !== "all") {
                url += `&game_id=${selectedMarket}`;
            }
            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (e) {
            console.error("Failed to fetch betting status", e);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedMarket]);

    useEffect(() => {
        if (user) {
            fetchMarkets();
            fetchStatus();
        }
    }, [user, fetchStatus]);

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center bg-background-dark text-white"><div className="animate-pulse">LOADING...</div></div>;

    const totalAmount = data.reduce((acc, curr) => acc + curr.market_total, 0);
    const totalBidsCount = data.reduce((acc, curr) => acc + curr.types.reduce((a, c) => a + c.bids.length, 0), 0);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="flex flex-col gap-8 max-w-7xl mx-auto">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Betting Status</h2>
                                <p className="text-text-secondary mt-1">Monitor real-time market liabilities and user bets.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                                <select
                                    value={selectedMarket}
                                    onChange={(e) => setSelectedMarket(e.target.value)}
                                    className="bg-surface-dark border border-border-dark rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="all">All Markets</option>
                                    {markets.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchStatus}
                                    className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 bg-surface-dark border-border-dark shadow-xl flex items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                    <span className="material-symbols-outlined text-3xl text-primary">payments</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Liability</p>
                                    <h4 className="text-3xl font-black text-white mt-1">₹{totalAmount.toLocaleString('en-IN')}</h4>
                                </div>
                            </Card>
                            <Card className="p-6 bg-surface-dark border-border-dark shadow-xl flex items-center gap-6">
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <span className="material-symbols-outlined text-3xl text-blue-400">receipt_long</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Bids</p>
                                    <h4 className="text-3xl font-black text-white mt-1">{totalBidsCount}</h4>
                                </div>
                            </Card>
                        </div>

                        {/* Market Bids List */}
                        <div className="flex flex-col gap-8">
                            {loading ? (
                                <div className="flex flex-col items-center py-20 opacity-50">
                                    <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-bold tracking-widest uppercase">Aggregating Bids...</p>
                                </div>
                            ) : data.length === 0 ? (
                                <Card className="p-20 flex flex-col items-center justify-center bg-surface-dark border-border-dark">
                                    <span className="material-symbols-outlined text-5xl mb-4 opacity-20">hourglass_empty</span>
                                    <h4 className="text-xl font-bold">No Bids Found</h4>
                                    <p className="text-text-secondary">No bets have been placed for the selected filters.</p>
                                </Card>
                            ) : (
                                data.map((market) => (
                                    <section key={market.game_id} className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-border-dark pb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-2 rounded-full bg-primary" />
                                                <h3 className="text-xl font-black uppercase tracking-tight">{market.game_name}</h3>
                                            </div>
                                            <div className="text-xs font-bold text-text-secondary bg-surface-dark px-3 py-1 rounded-full border border-border-dark">
                                                TOTAL: ₹{market.market_total.toLocaleString('en-IN')}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {market.types.sort((a, b) => b.total_points - a.total_points).map((group, idx) => {
                                                const groupId = `${market.game_id}-${group.bid_type}-${group.digit}-${group.session}`;
                                                const isExpanded = expandedGroups.includes(groupId);

                                                return (
                                                    <Card
                                                        key={idx}
                                                        className={cn(
                                                            "bg-surface-dark border-border-dark hover:border-primary/30 transition-all flex flex-col overflow-hidden",
                                                            isExpanded && "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4"
                                                        )}
                                                    >
                                                        <div className="p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-10 flex items-center justify-center rounded-lg bg-background-dark border border-white/5 font-black text-primary">
                                                                    {group.digit}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{group.bid_type.replace('_', ' ')}</p>
                                                                    <p className="text-[10px] text-text-secondary uppercase">{group.session} SESSION</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <p className="text-sm font-black text-white">₹{group.total_points}</p>
                                                                <button
                                                                    onClick={() => toggleGroup(groupId)}
                                                                    className="text-[10px] items-center flex gap-1 font-bold text-primary hover:text-white transition-colors"
                                                                >
                                                                    {group.bids.length} BIDS {isExpanded ? '▲' : '▼'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="border-t border-border-dark bg-background-dark/50 p-4">
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-left text-xs">
                                                                        <thead>
                                                                            <tr className="text-text-secondary border-b border-white/5">
                                                                                <th className="pb-2 font-bold uppercase tracking-wider">User</th>
                                                                                <th className="pb-2 font-bold uppercase tracking-wider">Phone</th>
                                                                                <th className="pb-2 font-bold uppercase tracking-wider">Amount</th>
                                                                                <th className="pb-2 font-bold uppercase tracking-wider">Time</th>
                                                                                <th className="pb-2 font-bold uppercase tracking-wider">Status</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {group.bids.map((bid, bIdx) => (
                                                                                <tr key={bIdx} className="border-b border-white/5 last:border-0">
                                                                                    <td className="py-2 font-semibold text-white">{bid.user_name}</td>
                                                                                    <td className="py-2 text-text-secondary">{bid.user_phone}</td>
                                                                                    <td className="py-2 font-black text-primary">₹{bid.points}</td>
                                                                                    <td className="py-2 text-text-secondary">{new Date(bid.created_at).toLocaleTimeString()}</td>
                                                                                    <td className="py-2">
                                                                                        <span className={cn(
                                                                                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                                                                            bid.status === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                                                                bid.status === 'win' ? "bg-success/10 text-success border border-success/20" :
                                                                                                    "bg-error/10 text-error border border-error/20"
                                                                                        )}>
                                                                                            {bid.status}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
