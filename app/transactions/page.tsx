"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function TransactionsHistoryPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination (Simple for now, limit high)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            if (typeFilter !== 'all') queryParams.append('type', typeFilter);
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            queryParams.append('page', page.toString());
            queryParams.append('limit', '50');

            const res = await fetch(`/api/admin/transactions?${queryParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [typeFilter, statusFilter, page]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-success/10 text-success border-success/20';
            case 'pending': return 'bg-warning/10 text-warning border-warning/20';
            case 'failed': case 'rejected': return 'bg-error/10 text-error border-error/20';
            default: return 'bg-white/10 text-white border-white/20';
        }
    };

    const getTypeColor = (type: string) => {
        if (type === 'deposit') return 'text-success';
        if (type === 'withdraw') return 'text-error';
        return 'text-white';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'deposit') return 'arrow_downward';
        if (type === 'withdraw') return 'arrow_upward';
        return 'sync_alt';
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="space-y-2 z-10">
                                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-4xl">history</span>
                                    Transaction History
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Global log of all deposits, withdrawals, and system credits.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchTransactions}
                                className="h-12 px-6 rounded-xl border border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-bold tracking-wide text-white z-10 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Refresh Records
                            </Button>
                        </div>

                        {/* Filters Section */}
                        <div className="flex flex-col sm:flex-row gap-4 bg-surface-dark p-4 rounded-xl border border-border-dark shadow-md z-10 relative">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">Transaction Type</label>
                                <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                                    <SelectTrigger className="w-full h-12 bg-background-dark border-border-dark focus:border-primary text-white rounded-lg pl-10 relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">swap_vert</span>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="deposit">Deposits Only</SelectItem>
                                        <SelectItem value="withdraw">Withdrawals Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">Status</label>
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                                    <SelectTrigger className="w-full h-12 bg-background-dark border-border-dark focus:border-primary text-white rounded-lg pl-10 relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">filter_alt</span>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="success">Success / Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected / Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-x-auto scrollbar-hide shadow-xl">
                            <Table>
                                <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Transaction ID / Date</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">User</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Type</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Amount</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Method</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                    <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING HISTORICAL DATA...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center space-y-2 text-text-secondary">
                                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                                                    <p className="font-medium text-lg text-white">No transactions found</p>
                                                    <p className="text-sm">Try adjusting your filters.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((tx) => (
                                            <TableRow key={tx._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-mono font-medium text-white/70 group-hover:text-primary transition-colors cursor-pointer" title="Copy ID">
                                                            {tx._id.substring(tx._id.length - 8).toUpperCase()}
                                                        </span>
                                                        <span className="text-[11px] text-text-secondary font-medium mt-1">
                                                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit', hour12: true
                                                            })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{tx.user_id?.name || 'Unknown User'}</span>
                                                        <span className="text-[11px] text-text-secondary mt-0.5">{tx.user_id?.mobile || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`material-symbols-outlined text-[16px] ${getTypeColor(tx.type)}`}>
                                                            {getTypeIcon(tx.type)}
                                                        </span>
                                                        <span className="text-sm font-bold capitalize text-white">{tx.type}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-black tracking-wider ${getTypeColor(tx.type)}`}>
                                                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-text-secondary border-border-dark bg-background-dark text-[10px] uppercase font-bold px-2 py-0.5">
                                                        {tx.payment_method || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(tx.status)}`}>
                                                        {tx.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="border-t border-border-dark p-4 flex items-center justify-between bg-background-dark/50">
                                    <span className="text-sm text-text-secondary font-medium">Page {page} of {totalPages}</span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            className="h-8 border-border-dark bg-surface-dark hover:text-primary hover:border-primary/50 text-xs font-bold"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            className="h-8 border-border-dark bg-surface-dark hover:text-primary hover:border-primary/50 text-xs font-bold"
                                        >
                                            Next
                                        </Button>
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
