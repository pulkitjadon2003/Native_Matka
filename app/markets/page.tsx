"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";

import { AddMarketModal } from "@/components/admin/AddMarketModal";
import { DeclareResultModal } from "@/components/admin/DeclareResultModal";

export default function MarketSettings() {
    useAuth(true); // Protect route

    const [markets, setMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMarketOpen, setIsAddMarketOpen] = useState(false);

    const [selectedMarketToEdit, setSelectedMarketToEdit] = useState<any>(null);

    // Result Declaration State
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<any>(null);

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        try {
            const res = await fetch("/api/markets");
            const data = await res.json();
            if (data.success) {
                setMarkets(data.data);
            }
        } catch (error) {
            console.error("Error fetching markets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResultModal = (market: any) => {
        setSelectedMarket(market);
        setIsResultModalOpen(true);
    };

    const handleEditMarket = (market: any) => {
        setSelectedMarketToEdit(market);
        setIsAddMarketOpen(true);
    };

    const handleCloseAddMarketModal = () => {
        setIsAddMarketOpen(false);
        setSelectedMarketToEdit(null);
    };

    const handleDeleteMarket = async (id: string) => {
        if (!confirm("Are you sure you want to delete this market?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/markets/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (res.ok) {
                fetchMarkets();
            } else {
                alert("Failed to delete market");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // Filter markets by type
    const mainMarkets = markets.filter(m => m.type === 'main');
    const starlineMarkets = markets.filter(m => m.type === 'starline');
    const galiMarkets = markets.filter(m => m.type === 'gali_disawar');

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
                                    <span className="material-symbols-outlined text-primary text-4xl">storefront</span>
                                    Market Management
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Configure bazars, timings, and declare live results.</p>
                            </div>
                            <Button
                                className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-6 rounded-xl"
                                size="lg"
                                bg-primary
                                onClick={() => setIsAddMarketOpen(true)}
                            >
                                <span className="material-symbols-outlined text-[20px] mr-2">add_circle</span>
                                Add New Bazar
                            </Button>
                        </div>

                        <AddMarketModal
                            isOpen={isAddMarketOpen}
                            onClose={handleCloseAddMarketModal}
                            onSuccess={fetchMarkets}
                            initialData={selectedMarketToEdit}
                        />

                        <DeclareResultModal
                            isOpen={isResultModalOpen}
                            onClose={() => setIsResultModalOpen(false)}
                            onSuccess={fetchMarkets}
                            market={selectedMarket}
                        />

                        <Tabs defaultValue="main" className="w-full">
                            <TabsList className="bg-surface-dark/50 p-1.5 border border-border-dark rounded-xl w-auto inline-flex gap-2">
                                <TabsTrigger value="main" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary/50 border border-transparent text-sm font-bold tracking-wide transition-all duration-300">
                                    <span className="material-symbols-outlined mr-2 text-[18px]">domain</span>
                                    Main Market
                                </TabsTrigger>
                                <TabsTrigger value="starline" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary/50 border border-transparent text-sm font-bold tracking-wide transition-all duration-300">
                                    <span className="material-symbols-outlined mr-2 text-[18px]">stars</span>
                                    Starline
                                </TabsTrigger>
                                <TabsTrigger value="gali" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-primary/50 border border-transparent text-sm font-bold tracking-wide transition-all duration-300">
                                    <span className="material-symbols-outlined mr-2 text-[18px]">casino</span>
                                    Gali Desawar
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="relative w-72 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary group-focus-within:text-primary transition-colors text-[20px]">search</span>
                                        <Input placeholder="Search markets by name..." className="pl-12 h-12 bg-surface-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary font-medium px-4 py-2 bg-surface-dark rounded-lg border border-border-dark">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                        Filter View
                                    </div>
                                </div>

                                <TabsContent value="main" className="mt-0 outline-none">
                                    <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-xl">
                                        <Table>
                                            <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Open Time</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Close Time</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Today&apos;s Result</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-16">
                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                                <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING MARKETS...</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : mainMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-16 text-text-secondary font-medium">No Main Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    mainMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                            <TableCell className="font-bold text-white px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/10">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[15px]">{market.name}</span>
                                                                        <span className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5 tracking-wider">ID: {market._id.substring(market._id.length - 6).toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[16px] text-primary/50">schedule</span>
                                                                    {market.open_time}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[16px] text-primary/50">schedule</span>
                                                                    {market.close_time}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="font-mono text-sm font-bold tracking-wider text-primary">
                                                                    {market.result?.open_panna || '***'}-{market.result?.open_digit || '*'}{market.result?.close_digit || '*'}-{market.result?.close_panna || '***'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center justify-center w-28 gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${market.is_active ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-error/70 hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="starline" className="mt-0 outline-none">
                                    <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-xl">
                                        <Table>
                                            <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Open Time</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-16">
                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                                <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING MARKETS...</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : starlineMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-16 text-text-secondary font-medium">No Starline Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    starlineMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                            <TableCell className="font-bold text-white px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/10">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[15px]">{market.name}</span>
                                                                        <span className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5 tracking-wider">ID: {market._id.substring(market._id.length - 6).toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[16px] text-primary/50">schedule</span>
                                                                    {market.open_time}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center justify-center w-28 gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${market.is_active ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-error/70 hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="gali" className="mt-0 outline-none">
                                    <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-xl">
                                        <Table>
                                            <TableHeader className="bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
                                                <TableRow className="hover:bg-transparent border-none">
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 px-6">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14">Open Time</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-text-secondary uppercase tracking-widest text-[11px] h-14 text-right px-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-16">
                                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                                                <span className="text-sm font-medium text-text-secondary tracking-widest">LOADING MARKETS...</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : galiMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-16 text-text-secondary font-medium">No Gali Disawar Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    galiMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/[0.02] border-border-dark transition-colors">
                                                            <TableCell className="font-bold text-white px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner shadow-primary/10">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[15px]">{market.name}</span>
                                                                        <span className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5 tracking-wider">ID: {market._id.substring(market._id.length - 6).toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-[16px] text-primary/50">schedule</span>
                                                                    {market.open_time}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center justify-center w-28 gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${market.is_active ? 'bg-success/10 text-success border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right px-6">
                                                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-text-secondary hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-lg text-error/70 hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}

