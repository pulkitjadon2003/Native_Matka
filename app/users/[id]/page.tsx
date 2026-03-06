"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

export default function UserDetailsPage() {
    useAuth(true); // Protect route

    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<any>(null);
    const [bids, setBids] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [bidsPage, setBidsPage] = useState(1);
    const [bidsTotal, setBidsTotal] = useState(1);

    const [txPage, setTxPage] = useState(1);
    const [txTotal, setTxTotal] = useState(1);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchBids();
    }, [userId, bidsPage]);

    useEffect(() => {
        if (userId) fetchTransactions();
    }, [userId, txPage]);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            } else {
                router.push('/users'); // Redirect if not found
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}/bids?page=${bidsPage}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setBids(data.data);
                setBidsTotal(data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${userId}/transactions?page=${txPage}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
                setTxTotal(data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        if (!confirm(`Are you sure you want to ${user.is_active ? 'block' : 'activate'} this user?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: !user.is_active })
            });

            const data = await res.json();
            if (data.success) {
                setUser({ ...user, is_active: !user.is_active });
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred");
        }
    };

    const handleResetPassword = async () => {
        if (!user) return;
        const newPassword = window.prompt(`Enter a new password for ${user.name}:`);
        if (!newPassword) return; // Cancelled or empty

        if (newPassword.length < 4) {
            alert("Password must be at least 4 characters long.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/users/${userId}/password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Password updated successfully for ${user.name}`);
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            alert("An error occurred while resetting password.");
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    {loading && !user ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                            <span className="text-sm font-bold text-text-secondary tracking-widest uppercase">LOADING PROFILE...</span>
                        </div>
                    ) : user ? (
                        <div className="max-w-6xl mx-auto space-y-6">

                            {/* Header / Profile Card */}
                            <div className="bg-surface-dark border border-border-dark rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

                                <div className="flex-shrink-0">
                                    <div className="size-28 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-5xl shadow-inner shadow-primary/20 uppercase">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <Badge variant="outline" className={`px-4 py-1 font-black tracking-widest uppercase text-[10px] ${user.is_active ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
                                            {user.is_active ? 'Active' : 'Blocked'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 w-full text-center md:text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center md:justify-start gap-3">
                                                {user.name}
                                                {user.is_verified && (
                                                    <span className="material-symbols-outlined text-success text-3xl" title="Verified Mobile">verified</span>
                                                )}
                                            </h2>
                                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                <p className="text-text-secondary font-medium tracking-wide flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                                    {user.mobile}
                                                </p>
                                                <p className="text-text-secondary text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                    ID: {user._id.substring(user._id.length - 8)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                variant="outline"
                                                className={`font-bold transition-all px-6 h-12 rounded-xl border ${user.is_active ? 'border-error/50 text-error hover:bg-error/10 hover:border-error' : 'border-success/50 text-success hover:bg-success/10 hover:border-success'}`}
                                                onClick={handleToggleStatus}
                                            >
                                                {user.is_active ? 'Block User' : 'Unblock User'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="font-bold transition-all px-6 h-12 rounded-xl border border-warning/50 text-warning hover:bg-warning/10 hover:border-warning"
                                                onClick={handleResetPassword}
                                            >
                                                Reset Password
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-background-dark/50 border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Wallet Balance</p>
                                            <p className="text-xl md:text-2xl font-black text-white tracking-wider flex items-center gap-1">
                                                <span className="text-primary text-xl">₹</span>
                                                {user.wallet_balance.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Account Secret</p>
                                            <p className="text-sm md:text-base font-mono font-bold text-white tracking-widest opacity-80">{user.mpin || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Joined On</p>
                                            <p className="text-sm md:text-base font-bold text-white tracking-wide">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">Banking Info</p>
                                            <p className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis w-24 md:w-full">
                                                {user.bank_details?.upi_id || user.bank_details?.account_number || 'Not Added'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <Tabs defaultValue="bids" className="w-full">
                                <TabsList className="bg-surface-dark border border-border-dark p-1 rounded-xl w-full sm:w-auto inline-flex h-12">
                                    <TabsTrigger value="bids" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none font-bold">
                                        Betting History
                                    </TabsTrigger>
                                    <TabsTrigger value="transactions" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none font-bold">
                                        Wallet Transactions
                                    </TabsTrigger>
                                </TabsList>

                                {/* Bids Tab */}
                                <TabsContent value="bids" className="mt-6 outline-none">
                                    <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-x-auto scrollbar-hide shadow-xl">
                                        <Table>
                                            <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Date</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Market</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Bid Details</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Amount</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bids.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-12 text-text-secondary font-medium">No betting history found.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    bids.map((bid) => (
                                                        <TableRow key={bid._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                            <TableCell className="px-6 font-medium text-text-secondary">
                                                                {new Date(bid.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-bold text-white">{bid.game_id?.name || 'Unknown'}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-primary capitalize">{bid.bid_type.replace('_', ' ')}</span>
                                                                        <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-white/10 bg-white/5">{bid.session}</Badge>
                                                                    </div>
                                                                    <span className="font-mono font-black text-white text-base bg-background-dark px-2 py-0.5 rounded w-fit border border-white/5">{bid.digit}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-black text-white tracking-wider">
                                                                ₹{bid.points}
                                                            </TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <span className={`inline-flex items-center justify-center min-w-[80px] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${bid.status === 'win' ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                                                                    bid.status === 'loss' ? 'bg-error/10 text-error border-error/20' :
                                                                        'bg-warning/10 text-warning border-warning/20'
                                                                    }`}>
                                                                    {bid.status}
                                                                </span>
                                                                {bid.status === 'win' && bid.win_amount > 0 && (
                                                                    <div className="mt-1 text-xs font-bold text-success w-full text-right">+₹{bid.win_amount}</div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination Controls */}
                                        {bidsTotal > 1 && (
                                            <div className="border-t border-border-dark p-4 flex items-center justify-between bg-background-dark/50">
                                                <span className="text-sm text-text-secondary font-medium">Page {bidsPage} of {bidsTotal}</span>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" disabled={bidsPage === 1} onClick={() => setBidsPage(p => Math.max(1, p - 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Prev</Button>
                                                    <Button variant="outline" size="sm" disabled={bidsPage === bidsTotal} onClick={() => setBidsPage(p => Math.min(bidsTotal, p + 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Next</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Transactions Tab */}
                                <TabsContent value="transactions" className="mt-6 outline-none">
                                    <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-x-auto scrollbar-hide shadow-xl">
                                        <Table>
                                            <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Date</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Details</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Type</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Amount</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-12 text-text-secondary font-medium">No wallet transactions found.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    transactions.map((tx) => (
                                                        <TableRow key={tx._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                            <TableCell className="px-6 font-medium text-text-secondary">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm text-white">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                    <span className="text-[10px]">{new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-xs text-text-secondary max-w-[200px] truncate block" title={tx.description}>{tx.description || tx.transaction_id || 'System Transfer'}</span>
                                                                {tx.payment_method && (
                                                                    <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0 border-white/10 bg-white/5 mt-1">{tx.payment_method}</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="font-bold text-white capitalize">{tx.type.replace('_', ' ')}</span>
                                                            </TableCell>
                                                            <TableCell className="font-black text-white tracking-wider">
                                                                <span className={['deposit', 'win', 'admin_credit'].includes(tx.type) ? 'text-success' : 'text-error'}>
                                                                    {['deposit', 'win', 'admin_credit'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <span className={`inline-flex items-center justify-center min-w-[80px] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${tx.status === 'success' ? 'bg-success/10 text-success border-success/20' :
                                                                    (tx.status === 'failed' || tx.status === 'rejected') ? 'bg-error/10 text-error border-error/20' :
                                                                        'bg-warning/10 text-warning border-warning/20'
                                                                    }`}>
                                                                    {tx.status}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination Controls */}
                                        {txTotal > 1 && (
                                            <div className="border-t border-border-dark p-4 flex items-center justify-between bg-background-dark/50">
                                                <span className="text-sm text-text-secondary font-medium">Page {txPage} of {txTotal}</span>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" disabled={txPage === 1} onClick={() => setTxPage(p => Math.max(1, p - 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Prev</Button>
                                                    <Button variant="outline" size="sm" disabled={txPage === txTotal} onClick={() => setTxPage(p => Math.min(txTotal, p + 1))} className="h-8 border-border-dark bg-surface-dark hover:text-primary">Next</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
