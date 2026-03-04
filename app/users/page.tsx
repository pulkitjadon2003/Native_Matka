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
import { AddFundsModal } from "@/components/admin/AddFundsModal";
import { useAuth } from "@/hooks/useAuth";

interface User {
    _id: string;
    name: string;
    mobile: string;
    wallet_balance: number;
    is_active: boolean;
    is_verified: boolean;
    createdAt: string;
}

export default function UsersPage() {
    useAuth(true); // Protect route

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                query: search
            });
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/users?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'block' : 'activate'} this user?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: !currentStatus })
            });

            const data = await res.json();
            if (data.success) {
                // Optimistic update
                setUsers(users.map(u => u._id === userId ? { ...u, is_active: !currentStatus } : u));
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred");
        }
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
                                    <span className="material-symbols-outlined text-primary text-4xl">group</span>
                                    User Management
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Manage registered users, wallet balances, and account status.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-surface-dark/50 p-2 rounded-xl border border-border-dark">
                            <div className="relative w-full sm:w-96 group ml-2 mt-2 sm:mt-0">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors text-[20px]">search</span>
                                <Input
                                    placeholder="Search by name or mobile..."
                                    className="pl-12 h-12 bg-surface-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl w-full"
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="flex items-center gap-4 px-4 py-2 bg-surface-dark rounded-xl border border-border-dark mr-2 mb-2 sm:mb-0">
                                <span className="text-sm font-bold text-text-secondary tracking-wide uppercase">Page {page} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline" size="icon"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="h-10 w-10 rounded-lg border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all text-text-secondary disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </Button>
                                    <Button
                                        variant="outline" size="icon"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-10 w-10 rounded-lg border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all text-text-secondary disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-xl">
                            <Table>
                                <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">User Info</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Mobile Number</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Wallet Balance</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Status</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Joined Date</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                    <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING USERS...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16 text-text-secondary font-medium">
                                                No users found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                <TableCell className="font-bold text-white px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/10 uppercase">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            {user.is_verified && (
                                                                <div className="absolute -bottom-1 -right-1 size-4 bg-background-dark rounded-full flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-[14px] text-success">verified</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[15px]">{user.name}</span>
                                                            <span className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5 tracking-wider">ID: {user._id.substring(user._id.length - 6).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-text-secondary font-medium tracking-wide">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary/50">call</span>
                                                        {user.mobile}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded bg-primary/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-[14px] text-primary">currency_rupee</span>
                                                        </div>
                                                        <span className="font-bold text-white tracking-wide">
                                                            {user.wallet_balance.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, user.is_active)}
                                                        className={`inline-flex items-center justify-center w-28 gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-all ${user.is_active
                                                            ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                                            : 'bg-error/10 text-error border-error/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                            }`}
                                                        title="Click to toggle status"
                                                    >
                                                        <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                        {user.is_active ? "Active" : "Blocked"}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right text-text-secondary font-medium">
                                                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-lg text-success hover:text-success hover:bg-success/10"
                                                            title="Add Funds"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsAddFundsOpen(true);
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-primary hover:text-primary hover:bg-primary/10" title="Edit User">
                                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/10" title="View History">
                                                            <span className="material-symbols-outlined text-[20px]">history</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <AddFundsModal
                    isOpen={isAddFundsOpen}
                    onClose={() => setIsAddFundsOpen(false)}
                    user={selectedUser}
                    onSuccess={fetchUsers}
                />
            </main>
        </div>
    );
}
