"use client";

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

export default function Reports() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
                                <p className="text-text-secondary">View betting history and market performance.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="text-white border-white/20">
                                    <span className="material-symbols-outlined text-[20px] mr-2">download</span>
                                    Export CSV
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center bg-surface-dark p-4 rounded-xl border border-border-dark">
                            <div className="w-full md:w-64">
                                <label className="text-xs text-text-secondary mb-1 block">Filter by Date</label>
                                <Input type="date" className="[color-scheme:dark]" />
                            </div>
                            <div className="w-full md:w-64">
                                <label className="text-xs text-text-secondary mb-1 block">Filter by Market</label>
                                <select className="flex h-10 w-full rounded-md border border-border-dark bg-surface-dark px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                    <option>All Markets</option>
                                    <option>Kalyan Main</option>
                                    <option>Madhur Morning</option>
                                </select>
                            </div>
                            <div className="pt-5">
                                <Button>Apply Filters</Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                            <Table>
                                <TableHeader className="bg-[#1c1a11]">
                                    <TableRow className="hover:bg-transparent border-border-dark">
                                        <TableHead className="font-bold text-white">Date</TableHead>
                                        <TableHead className="font-bold text-white">Market</TableHead>
                                        <TableHead className="font-bold text-white">Total Bets</TableHead>
                                        <TableHead className="font-bold text-white">Total Amount</TableHead>
                                        <TableHead className="font-bold text-white">Winning Amount</TableHead>
                                        <TableHead className="font-bold text-white">Profit/Loss</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-white/5">
                                        <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                                            No reports generated for this period.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
