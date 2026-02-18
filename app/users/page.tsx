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

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                                <p className="text-text-secondary">Manage registered users, balances, and status.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 bg-surface-dark p-4 rounded-xl border border-border-dark">
                            <div className="relative flex-1 max-w-sm">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">search</span>
                                <Input
                                    placeholder="Search by name or mobile..."
                                    className="pl-10 bg-background-dark border-border-dark focus:border-primary"
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline" size="icon"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="h-8 w-8"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                    </Button>
                                    <Button
                                        variant="outline" size="icon"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="h-8 w-8"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                            <Table>
                                <TableHeader className="bg-[#1c1a11]">
                                    <TableRow className="hover:bg-transparent border-border-dark">
                                        <TableHead className="font-bold text-white">User Info</TableHead>
                                        <TableHead className="font-bold text-white">Mobile</TableHead>
                                        <TableHead className="font-bold text-white">Wallet Balance</TableHead>
                                        <TableHead className="font-bold text-white text-center">Status</TableHead>
                                        <TableHead className="font-bold text-white text-right">Joined</TableHead>
                                        <TableHead className="font-bold text-white text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-text-secondary">
                                                <div className="flex justify-center items-center gap-2">
                                                    <span className="animate-spin material-symbols-outlined text-primary">progress_activity</span>
                                                    Loading users...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-text-secondary">
                                                No users found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user._id} className="group hover:bg-white/5 border-border-dark">
                                                <TableCell className="font-medium text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{user.name}</p>
                                                            {user.is_verified && <p className="text-[10px] text-success flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">verified</span> Verified</p>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-text-secondary font-mono">{user.mobile}</TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-primary">₹ {user.wallet_balance}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id, user.is_active)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${user.is_active
                                                            ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                                                            : 'bg-error/10 text-error border-error/20 hover:bg-error/20'
                                                            }`}
                                                        title="Click to toggle status"
                                                    >
                                                        <span className={`size-1.5 rounded-full ${user.is_active ? 'bg-success' : 'bg-error'}`}></span>
                                                        {user.is_active ? "Active" : "Blocked"}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right text-text-secondary text-xs">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                                            title="Add Funds"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsAddFundsOpen(true);
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" title="Edit User">
                                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-white hover:bg-white/10" title="View History">
                                                            <span className="material-symbols-outlined text-[18px]">history</span>
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
