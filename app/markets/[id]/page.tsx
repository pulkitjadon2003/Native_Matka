"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

export default function MarketHistoryPage() {
    useAuth(true);

    const params = useParams();
    const router = useRouter();
    const marketId = params.id as string;

    const [market, setMarket] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (marketId) fetchHistory();
    }, [marketId, page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/markets/${marketId}/history?page=${page}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMarket(data.data.game);
                setHistory(data.data.history);
                setTotalPages(data.pagination.totalPages);
            } else {
                router.push('/markets');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    {loading && !market ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            <span className="text-sm font-bold text-text-secondary tracking-widest uppercase">LOADING MARKET DETAILS...</span>
                        </div>
                    ) : market ? (
                        <div className="max-w-6xl mx-auto space-y-6">

                            {/* Header Card */}
                            <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

                                <div className="flex-shrink-0">
                                    <div className="size-24 md:size-28 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-5xl shadow-inner shadow-primary/20 uppercase">
                                        {market.name.charAt(0)}
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <Badge variant="outline" className={`px-4 py-1 font-black tracking-widest uppercase text-[10px] ${market.is_active ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
                                            {market.is_active ? 'Active' : 'Closed'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 w-full text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                                                {market.name}
                                            </h2>
                                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                <Badge variant="outline" className="bg-white/5 border-white/10 text-text-secondary uppercase">
                                                    {market.type.replace('_', ' ')}
                                                </Badge>
                                                <p className="text-text-secondary text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                    ID: {market._id.substring(market._id.length - 8)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center md:items-end gap-1 bg-background-dark/50 p-3 rounded-xl border border-white/5">
                                            <span className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Latest Result</span>
                                            <span className="text-xl md:text-2xl font-black font-mono text-primary tracking-wider">
                                                {market.result?.open_panna || '***'}-{market.result?.open_digit || '*'}{market.result?.close_digit || '*'}-{market.result?.close_panna || '***'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-background-dark/50 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Open Time</p>
                                            <p className="text-lg md:text-xl font-bold text-white tracking-wider flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[18px] text-primary/70">wb_sunny</span>
                                                {market.open_time}
                                            </p>
                                        </div>
                                        {market.type === 'main' && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Close Time</p>
                                                <p className="text-lg md:text-xl font-bold text-white tracking-wider flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[18px] text-primary/70">nights_stay</span>
                                                    {market.close_time}
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Operating Days</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {market.days_open.map((day: boolean, index: number) => {
                                                    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                                                    return (
                                                        <span key={index} className={`flex items-center justify-center size-6 text-[10px] font-bold rounded-md border ${day ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/5 text-text-secondary/50 border-white/10'}`}>
                                                            {days[index]}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History Table Section */}
                            <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-x-auto scrollbar-hide shadow-xl">
                                <div className="p-4 md:p-6 border-b border-border-dark bg-background-dark/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">history</span>
                                        Market History
                                    </h3>
                                    <span className="text-sm font-medium text-text-secondary">
                                        Showing past results and betting volumes
                                    </span>
                                </div>
                                <Table>
                                    <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Date</TableHead>
                                            <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Declared Result</TableHead>
                                            <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Total Bets</TableHead>
                                            <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Collection</TableHead>
                                            <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Total Payouts</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-16 text-text-secondary font-medium">
                                                    No history found for this market.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            history.map((record, index) => {
                                                const pl = record.stats.total_amount - record.stats.total_payout;
                                                const isProfit = pl >= 0;

                                                return (
                                                    <TableRow key={index} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                        <TableCell className="px-6 font-medium">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-sm text-white">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="inline-block bg-background-dark border border-white/5 rounded-lg px-4 py-1.5 shadow-inner">
                                                                <span className="font-mono text-lg font-black tracking-widest text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                                                                    {market.type === 'main' ?
                                                                        `${record.open_panna}-${record.open_digit}${record.close_digit}-${record.close_panna}` :
                                                                        market.type === 'starline' ?
                                                                            `${record.open_panna}-${record.open_digit}` :
                                                                            `${record.open_digit}${record.close_digit}`
                                                                    }
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="font-bold text-white">{record.stats.total_bets}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className="font-black text-white transform-wider">₹{record.stats.total_amount.toLocaleString('en-IN')}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right px-6">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="font-black tracking-wider text-error opacity-90">
                                                                    ₹{record.stats.total_payout.toLocaleString('en-IN')}
                                                                </span>
                                                                <Badge variant="outline" className={`text-[9px] uppercase font-bold px-1.5 py-0 border-white/10 ${isProfit ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
                                                                    {isProfit ? `PROFIT: +₹${pl.toLocaleString('en-IN')}` : `LOSS: -₹${Math.abs(pl).toLocaleString('en-IN')}`}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="border-t border-border-dark p-4 flex items-center justify-between bg-background-dark/50">
                                        <span className="text-sm text-text-secondary font-medium">Page {page} of {totalPages}</span>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Prev</Button>
                                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Next</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
