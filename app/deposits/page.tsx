"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function DepositsPage() {
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/deposits', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDeposits(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, status: 'success' | 'rejected') => {
        if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

        setActionLoading(id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/deposits/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                // Remove from local state
                setDeposits(prev => prev.filter(d => d._id !== id));
                alert(`Deposit ${status} successfully.`);
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
                                    <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                                    Pending Deposits
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Review and process user deposit requests manually.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={fetchDeposits}
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
                        ) : deposits.length === 0 ? (
                            <Card className="p-16 text-center bg-surface-dark border-dashed border-border-dark shadow-xl rounded-2xl flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-border-dark text-6xl mb-4">inbox</span>
                                <h3 className="text-xl font-bold text-white mb-2">No pending deposits</h3>
                                <p className="text-sm text-text-secondary">All requests have been processed or none exist right now.</p>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {deposits.map((deposit) => (
                                    <Card key={deposit._id} className="p-5 md:p-6 flex flex-col md:flex-row gap-6 md:items-center bg-surface-dark border-border-dark rounded-2xl shadow-xl hover:border-primary/30 transition-colors">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-sm font-black px-3 py-1">
                                                    ₹{deposit.amount}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white border-none font-bold tracking-wide px-3 py-1 uppercase text-[10px]">
                                                    {deposit.payment_method}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 bg-background-dark p-4 rounded-xl border border-white/5">
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">User Details</p>
                                                    <p className="font-bold text-white text-sm">{deposit.user_id?.name || 'Unknown'}</p>
                                                    <p className="text-text-secondary text-xs mt-0.5">{deposit.user_id?.mobile || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-text-secondary font-bold uppercase tracking-wider text-[10px] mb-1">Submitted At</p>
                                                    <p className="text-white text-sm font-semibold">{new Date(deposit.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-text-secondary text-xs mt-0.5">{new Date(deposit.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Screenshot Display */}
                                        <div className="w-full md:w-36 h-40 md:h-36 bg-background-dark rounded-xl overflow-hidden border border-border-dark flex-shrink-0 cursor-pointer group relative" onClick={() => deposit.receipt_img && window.open(deposit.receipt_img, '_blank')}>
                                            {deposit.receipt_img ? (
                                                <>
                                                    <img src={deposit.receipt_img} alt="Receipt" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                                        <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-border-dark">
                                                    <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
                                                    <span className="text-xs font-bold uppercase text-text-secondary tracking-widest">No Receipt</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                                            <Button
                                                className="flex-1 bg-success hover:bg-success/90 text-white font-bold h-11 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                                                disabled={actionLoading === deposit._id}
                                                onClick={() => handleAction(deposit._id, 'success')}
                                            >
                                                {actionLoading === deposit._id ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                                    </span>
                                                ) : 'Approve'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-error/30 text-error hover:bg-error/10 hover:text-error hover:border-error/50 font-bold h-11 rounded-xl transition-all"
                                                disabled={actionLoading === deposit._id}
                                                onClick={() => handleAction(deposit._id, 'rejected')}
                                            >
                                                Reject
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
