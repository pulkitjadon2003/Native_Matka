"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/withdrawals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setWithdrawals(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'success' | 'rejected') => {
        const actionText = status === 'success' ? 'approve' : 'reject and refund';
        if (!confirm(`Are you sure you want to ${actionText} this withdrawal?`)) return;

        setActionLoading(id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/withdrawals/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                setWithdrawals(prev => prev.filter(w => w._id !== id));
                alert(data.message);
            } else {
                alert(`Failed: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="space-y-2 z-10">
                                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
                                    Pending Withdrawals
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Review withdrawal requests. Rejecting will refund the amount to the user&apos;s wallet.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchWithdrawals}
                                className="h-12 px-6 rounded-xl border border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-bold tracking-wide text-white z-10 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Refresh List
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                <span className="text-sm font-medium text-text-secondary tracking-widest uppercase">LOADING REQUESTS...</span>
                            </div>
                        ) : withdrawals.length === 0 ? (
                            <Card className="p-16 text-center bg-surface-dark border-dashed border-border-dark shadow-xl rounded-2xl flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-border-dark text-6xl mb-4">inbox</span>
                                <h3 className="text-xl font-bold text-white mb-2">No pending withdrawals</h3>
                                <p className="text-sm text-text-secondary">All withdrawal requests have been processed.</p>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {withdrawals.map((withdrawal) => (
                                    <Card key={withdrawal._id} className="p-5 md:p-6 flex flex-col md:flex-row gap-6 md:items-center bg-surface-dark border-border-dark rounded-2xl shadow-xl hover:border-primary/30 transition-colors">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-error border-error/30 bg-error/5 text-sm font-black px-3 py-1">
                                                    ₹{withdrawal.amount}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-none font-bold tracking-wide px-3 py-1 uppercase text-[10px]">
                                                    {withdrawal.payment_method}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-none font-bold tracking-wide px-3 py-1 uppercase text-[10px]">
                                                    On Hold
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-background-dark p-4 rounded-xl border border-white/5">
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">User Details</p>
                                                    <p className="font-bold text-white text-sm">{withdrawal.user_id?.name || 'Unknown'}</p>
                                                    <p className="text-text-secondary text-xs mt-0.5">{withdrawal.user_id?.mobile || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">Bank Account</p>
                                                    {withdrawal.user_id?.payment_methods?.bank ? (
                                                        <>
                                                            <p className="font-bold text-white text-sm">{withdrawal.user_id.payment_methods.bank.account_number}</p>
                                                            <p className="text-text-secondary text-[10px] mt-0.5">
                                                                {withdrawal.user_id.payment_methods.bank.bank_name} ({withdrawal.user_id.payment_methods.bank.ifsc})
                                                            </p>
                                                            <p className="text-text-secondary text-[10px] italic">{withdrawal.user_id.payment_methods.bank.holder_name}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-text-secondary text-sm font-medium">Not Provided</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">UPI Details</p>
                                                    <p className="font-bold text-white text-sm">{withdrawal.user_id?.payment_methods?.upi || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">Requested At</p>
                                                    <p className="text-white text-sm font-semibold">{new Date(withdrawal.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-text-secondary text-xs mt-0.5">{new Date(withdrawal.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                                            <Button
                                                className="flex-1 bg-success hover:bg-success/90 text-white font-bold h-11 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                                                disabled={actionLoading === withdrawal._id}
                                                onClick={() => handleAction(withdrawal._id, 'success')}
                                            >
                                                {actionLoading === withdrawal._id ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                                    </span>
                                                ) : 'Approve'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-error/30 text-error hover:bg-error/10 hover:text-error hover:border-error/50 font-bold h-11 rounded-xl transition-all"
                                                disabled={actionLoading === withdrawal._id}
                                                onClick={() => handleAction(withdrawal._id, 'rejected')}
                                            >
                                                Reject & Refund
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
