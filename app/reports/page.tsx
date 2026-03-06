"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

export default function Reports() {
    useAuth(true);

    const [reports, setReports] = useState<any[]>([]);
    const [markets, setMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateFilter, setDateFilter] = useState<string>("");
    const [marketFilter, setMarketFilter] = useState<string>("all");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchMarkets();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [page]); // Re-fetch when page changes. (Filter application is manual via button)

    const fetchMarkets = async () => {
        try {
            const token = localStorage.getItem('token');
            // We can use the admin markets endpoint to get the list
            const res = await fetch('/api/admin/markets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setMarkets(data.data.main.concat(data.data.starline).concat(data.data.gali));
            }
        } catch (error) {
            console.error("Failed to load markets for filter", error);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            if (dateFilter) queryParams.append('date', dateFilter);
            if (marketFilter !== 'all') queryParams.append('market_id', marketFilter);
            queryParams.append('page', page.toString());
            queryParams.append('limit', '30');

            const res = await fetch(`/api/admin/reports?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setReports(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error(error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchReports();
    };

    const downloadCSV = () => {
        if (reports.length === 0) return;

        // Generate CSV string
        const headers = ["Date", "Market Name", "Total Bets", "Collection (₹)", "Payouts (₹)", "Profit/Loss (₹)"];

        const rows = reports.map(r => {
            const pl = r.total_amount - r.total_winning_amount;
            return [
                r.date,
                `"${r.game_name}"`,
                r.total_bets,
                r.total_amount,
                r.total_winning_amount,
                pl
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Matka_Admin_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="space-y-2 z-10">
                                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-4xl">bar_chart</span>
                                    Financial Reports
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">View betting history, market performance, and detailed financial analytics.</p>
                            </div>
                            <Button
                                onClick={downloadCSV}
                                disabled={reports.length === 0}
                                className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-6 rounded-xl bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[20px] mr-2">download</span>
                                Export CSV
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end gap-6 bg-surface-dark/50 p-4 rounded-2xl border border-border-dark shadow-md">
                            <div className="w-full sm:w-1/3">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 block flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    Filter by Date
                                </label>
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="[color-scheme:dark] bg-surface-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl h-12"
                                />
                            </div>
                            <div className="w-full sm:w-1/3">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 block flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                                    Filter by Market
                                </label>
                                <select
                                    value={marketFilter}
                                    onChange={(e) => setMarketFilter(e.target.value)}
                                    className="flex h-12 w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none cursor-pointer"
                                >
                                    <option value="all">All Markets</option>
                                    {markets.map(m => (
                                        <option key={m._id} value={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-auto flex gap-4">
                                <Button
                                    onClick={handleApplyFilters}
                                    className="h-12 px-8 rounded-xl bg-surface-dark border border-border-dark hover:bg-white/5 hover:border-primary/50 text-white font-bold tracking-wide transition-all shadow-md w-full sm:w-auto"
                                >
                                    <span className="material-symbols-outlined text-[18px] mr-2">filter_alt</span>
                                    Apply Filters
                                </Button>
                                {(dateFilter || marketFilter !== 'all') && (
                                    <Button
                                        onClick={() => {
                                            setDateFilter("");
                                            setMarketFilter("all");
                                            setPage(1);
                                            // The state updates are async, so let's trigger fetch without state values
                                            setTimeout(() => {
                                                const token = localStorage.getItem('token');
                                                fetch(`/api/admin/reports?page=1&limit=30`, {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                }).then(res => res.json()).then(data => {
                                                    if (data.success) {
                                                        setReports(data.data);
                                                        setTotalPages(data.pagination?.totalPages || 1);
                                                    }
                                                });
                                            }, 50);
                                        }}
                                        className="h-12 px-4 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 text-error font-bold tracking-wide transition-all w-full sm:w-auto"
                                        title="Clear Filters"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-x-auto scrollbar-hide shadow-xl">
                            <Table>
                                <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Date</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Market</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Total Bets</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Collection</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Payouts</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Profit/Loss</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                    <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING REPORTS...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : reports.length === 0 ? (
                                        <TableRow className="group border-border-dark transition-colors">
                                            <TableCell colSpan={6} className="text-center py-20 text-text-secondary font-medium hover:bg-transparent">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                                                        <span className="material-symbols-outlined text-3xl text-primary/50">receipt_long</span>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-white font-bold text-lg">No reports found</span>
                                                        <span className="text-sm mt-1">Adjust your filters or wait for more betting activity.</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports.map((report, idx) => {
                                            const pl = report.total_amount - report.total_winning_amount;
                                            const isProfit = pl >= 0;

                                            return (
                                                <TableRow key={`${report.game_id}-${report.date}-${idx}`} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white">{new Date(report.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-0.5">{new Date(report.date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-primary tracking-wide text-[15px]">{report.game_name}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="font-bold text-white text-[15px]">{report.total_bets}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 text-white font-black tracking-wider text-[15px]">
                                                            <span className="text-primary/70">₹</span>
                                                            {report.total_amount.toLocaleString('en-IN')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right border-x border-white/5">
                                                        <div className="flex items-center justify-end gap-1 text-error/90 font-black tracking-wider text-[15px]">
                                                            <span className="text-error/70">₹</span>
                                                            {report.total_winning_amount.toLocaleString('en-IN')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right px-6">
                                                        <div className="flex flex-col items-end justify-center">
                                                            <span className={`font-black tracking-wider text-lg ${isProfit ? 'text-success' : 'text-error'}`}>
                                                                {isProfit ? '+' : '-'}₹{Math.abs(pl).toLocaleString('en-IN')}
                                                            </span>
                                                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm mt-1 ${isProfit ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                                                {isProfit ? 'PROFIT' : 'LOSS'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
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
                </div>
            </main>
        </div>
    );
}
