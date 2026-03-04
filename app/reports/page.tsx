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
                            <Button className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-6 rounded-xl bg-primary">
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
                                <Input type="date" className="[color-scheme:dark] bg-surface-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl h-12" />
                            </div>
                            <div className="w-full sm:w-1/3">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 block flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                                    Filter by Market
                                </label>
                                <select className="flex h-12 w-full rounded-xl border border-border-dark bg-surface-dark px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary appearance-none cursor-pointer">
                                    <option>All Markets</option>
                                    <option>Kalyan Main</option>
                                    <option>Madhur Morning</option>
                                </select>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Button className="h-12 px-8 rounded-xl bg-surface-dark border border-border-dark hover:bg-white/5 hover:border-primary/50 text-white font-bold tracking-wide transition-all shadow-md w-full sm:w-auto">
                                    <span className="material-symbols-outlined text-[18px] mr-2">filter_alt</span>
                                    Apply Filters
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-xl">
                            <Table>
                                <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Date</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Market</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Total Bets</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Total Amount</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right">Winning Amount</TableHead>
                                        <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Profit/Loss</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                        <TableCell colSpan={6} className="text-center py-20 text-text-secondary font-medium">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                                                    <span className="material-symbols-outlined text-3xl text-primary/50">receipt_long</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-white font-bold text-lg">No reports found</span>
                                                    <span className="text-sm mt-1">Adjust your filters or generate new data.</span>
                                                </div>
                                            </div>
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
