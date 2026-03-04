"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface GameRate {
    type: string;
    name: string;
    rate: string;
}

export default function GameRatesSettings() {
    useAuth(true); // Protect route

    const [rates, setRates] = useState<GameRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const res = await fetch("/api/games/rates");
            const data = await res.json();
            if (data.success) {
                setRates(data.data);
            }
        } catch (error) {
            console.error("Error fetching rates:", error);
            setMessage({ type: 'error', text: "Failed to load rates" });
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (index: number, value: string) => {
        const newRates = [...rates];
        newRates[index].rate = value;
        setRates(newRates);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/games/rates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rates })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: "Game rates updated successfully" });
                setRates(data.data);
            } else {
                setMessage({ type: 'error', text: data.message || "Failed to update rates" });
            }
        } catch (error) {
            console.error("Error saving rates:", error);
            setMessage({ type: 'error', text: "An error occurred while saving" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 scrollbar-hide">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-surface-dark p-6 rounded-2xl border border-border-dark shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="space-y-2 z-10">
                                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-4xl">percent</span>
                                    Game Rates Setup
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Manage payout ratios and winning rates for all game types.</p>
                            </div>
                        </div>

                        <Card className="bg-surface-dark border-border-dark rounded-2xl shadow-xl overflow-hidden">
                            <CardHeader className="border-b border-border-dark p-6 md:p-8">
                                <CardTitle className="text-xl font-black text-white tracking-wide flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <span className="material-symbols-outlined text-primary">price_change</span>
                                    </div>
                                    Dividend & Payout Rates
                                </CardTitle>
                                <CardDescription className="text-text-secondary font-medium tracking-wide mt-2">
                                    Set the winning ratio for each game type (e.g., 1:10 means a ₹10 payout for every ₹1 bet).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                        <span className="text-sm font-medium text-text-secondary tracking-widest uppercase">LOADING RATES...</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSave} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {rates.map((rate, index) => (
                                                <div key={rate.type} className="space-y-3">
                                                    <Label htmlFor={`rate-${index}`} className="text-text-secondary font-bold uppercase tracking-wider text-xs">
                                                        {rate.name}
                                                    </Label>
                                                    <div className="relative group">
                                                        <div className="absolute left-0 inset-y-0 w-14 bg-background-dark/80 backdrop-blur-sm border-r border-border-dark flex items-center justify-center rounded-l-xl text-text-secondary font-bold group-focus-within:text-primary transition-colors">
                                                            1 :
                                                        </div>
                                                        <Input
                                                            id={`rate-${index}`}
                                                            value={rate.rate.replace('1:', '')}
                                                            onChange={(e) => handleRateChange(index, `1:${e.target.value}`)}
                                                            className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl text-white pl-[70px] font-bold text-lg"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {message && (
                                            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                                                <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                                                {message.text}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-6 border-t border-border-dark">
                                            <Button
                                                type="submit"
                                                className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] h-12 px-8 rounded-xl bg-primary min-w-[160px]"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                                                        Saving...
                                                    </span>
                                                ) : "Save Changes"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
