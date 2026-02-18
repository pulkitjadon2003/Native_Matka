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

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold tracking-tight">Market Overview</h2>
                                <p className="text-text-secondary">Manage game bazars, timings, and status.</p>
                            </div>
                            <Button
                                className="font-bold text-black"
                                size="lg"
                                onClick={() => setIsAddMarketOpen(true)}
                            >
                                <span className="material-symbols-outlined text-[20px] mr-2">add_circle</span>
                                Add Bazar
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
                            <TabsList className="bg-transparent p-0 border-b border-white/10 w-auto justify-start gap-6">
                                <TabsTrigger value="main" className="bg-transparent p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent text-base">
                                    <span className="material-symbols-outlined mr-2">domain</span>
                                    Main Market
                                </TabsTrigger>
                                <TabsTrigger value="starline" className="bg-transparent p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent text-base">
                                    <span className="material-symbols-outlined mr-2">stars</span>
                                    Starline
                                </TabsTrigger>
                                <TabsTrigger value="gali" className="bg-transparent p-0 pb-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent text-base">
                                    <span className="material-symbols-outlined mr-2">casino</span>
                                    Gali Desawar
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="relative w-64">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">search</span>
                                        <Input placeholder="Search markets..." className="pl-10" />
                                    </div>
                                </div>

                                <TabsContent value="main" className="mt-0">
                                    <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-[#1c1a11]">
                                                <TableRow className="hover:bg-transparent border-border-dark">
                                                    <TableHead className="font-bold text-white">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-white">Open Time</TableHead>
                                                    <TableHead className="font-bold text-white">Close Time</TableHead>
                                                    <TableHead className="font-bold text-white text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-white text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                                    </TableRow>
                                                ) : mainMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-text-secondary">No Main Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    mainMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/5">
                                                            <TableCell className="font-medium text-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p>{market.name}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary">{market.open_time}</TableCell>
                                                            <TableCell className="text-text-secondary">{market.close_time}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${market.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-error hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
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

                                <TabsContent value="starline" className="mt-0">
                                    <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-[#1c1a11]">
                                                <TableRow className="hover:bg-transparent border-border-dark">
                                                    <TableHead className="font-bold text-white">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-white">Open Time</TableHead>
                                                    <TableHead className="font-bold text-white">Close Time</TableHead>
                                                    <TableHead className="font-bold text-white text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-white text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                                    </TableRow>
                                                ) : starlineMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-text-secondary">No Starline Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    starlineMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/5">
                                                            <TableCell className="font-medium text-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p>{market.name}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary">{market.open_time}</TableCell>
                                                            <TableCell className="text-text-secondary">{market.close_time}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${market.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-error hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
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

                                <TabsContent value="gali" className="mt-0">
                                    <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-[#1c1a11]">
                                                <TableRow className="hover:bg-transparent border-border-dark">
                                                    <TableHead className="font-bold text-white">Bazar Name</TableHead>
                                                    <TableHead className="font-bold text-white">Open Time</TableHead>
                                                    <TableHead className="font-bold text-white">Close Time</TableHead>
                                                    <TableHead className="font-bold text-white text-center">Status</TableHead>
                                                    <TableHead className="font-bold text-white text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                                    </TableRow>
                                                ) : galiMarkets.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-8 text-text-secondary">No Gali Disawar Markets Found</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    galiMarkets.map((market) => (
                                                        <TableRow key={market._id} className="group hover:bg-white/5">
                                                            <TableCell className="font-medium text-white">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                        {market.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p>{market.name}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-text-secondary">{market.open_time}</TableCell>
                                                            <TableCell className="text-text-secondary">{market.close_time}</TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${market.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                                                                    <span className={`size-1.5 rounded-full ${market.is_active ? 'bg-success animate-pulse' : 'bg-error'}`}></span>
                                                                    {market.is_active ? "Active" : "Closed"}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                                        onClick={() => handleOpenResultModal(market)}
                                                                        title="Declare Result"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">fact_check</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
                                                                        onClick={() => handleEditMarket(market)}
                                                                        title="Edit Bazar"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-error hover:text-error hover:bg-error/10"
                                                                        onClick={() => handleDeleteMarket(market._id)}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
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

