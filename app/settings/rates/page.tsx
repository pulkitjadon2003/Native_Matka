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

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold tracking-tight">Game Rates</h2>
                            <p className="text-text-secondary">Manage payout rates for different game types.</p>
                        </div>

                        <Card className="bg-surface-dark border-border-dark">
                            <CardHeader>
                                <CardTitle className="text-white">Payout Rates</CardTitle>
                                <CardDescription className="text-text-secondary">
                                    Set the winning ratio for each game type (e.g., 1:10 means 10x payout).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-text-secondary">Loading rates...</div>
                                ) : (
                                    <form onSubmit={handleSave} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {rates.map((rate, index) => (
                                                <div key={rate.type} className="space-y-2">
                                                    <Label htmlFor={`rate-${index}`} className="text-white">{rate.name}</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium">1 :</span>
                                                        <Input
                                                            id={`rate-${index}`}
                                                            value={rate.rate.replace('1:', '')}
                                                            onChange={(e) => handleRateChange(index, `1:${e.target.value}`)}
                                                            className="bg-background-dark border-border-dark text-white pl-8"
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {message && (
                                            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                                                {message.text}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                className="bg-primary hover:bg-primary/90 text-black font-bold"
                                                disabled={saving}
                                            >
                                                {saving ? "Saving..." : "Save Changes"}
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
