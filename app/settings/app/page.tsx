"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function AppSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        min_deposit: 500,
        max_deposit: 100000,
        min_withdraw: 1000,
        max_withdraw: 50000,
        welcome_bonus: 50,
        app_version: '1.0.0',
        withdraw_open_time: '10:00',
        withdraw_close_time: '18:00'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data) {
                setSettings({
                    ...settings,
                    ...data.data
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span className="text-sm font-medium text-text-secondary tracking-widest uppercase">LOADING SETTINGS...</span>
            </div>
        </div>
    );

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
                                    <span className="material-symbols-outlined text-primary text-4xl">settings_applications</span>
                                    App Configuration
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Configure general settings, limits, and operational timings.</p>
                            </div>
                            <Button onClick={handleSave} disabled={saving} className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-8 rounded-xl bg-primary">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                        {/* General Settings */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">tune</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">General Settings</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Basic Application Parameters</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">App Version</Label>
                                    <Input
                                        placeholder="1.0.0"
                                        value={settings.app_version}
                                        onChange={(e) => handleChange('app_version', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Joining Bonus (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={settings.welcome_bonus}
                                        onChange={(e) => handleChange('welcome_bonus', Number(e.target.value))}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Limits */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">payments</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">Transaction Limits</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Deposit & Withdrawal Constraints</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Min Deposit Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.min_deposit}
                                        onChange={(e) => handleChange('min_deposit', Number(e.target.value))}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Max Deposit Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.max_deposit}
                                        onChange={(e) => handleChange('max_deposit', Number(e.target.value))}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Min Withdrawal Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.min_withdraw}
                                        onChange={(e) => handleChange('min_withdraw', Number(e.target.value))}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Max Withdrawal Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={settings.max_withdraw}
                                        onChange={(e) => handleChange('max_withdraw', Number(e.target.value))}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Timing Settings */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">Operational Timings</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">System Availability Limits</p>
                                </div>
                            </div>
                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Withdraw Open Time</Label>
                                    <Input
                                        type="time"
                                        value={settings.withdraw_open_time}
                                        onChange={(e) => handleChange('withdraw_open_time', e.target.value)}
                                        className="[color-scheme:dark] h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Withdraw Close Time</Label>
                                    <Input
                                        type="time"
                                        value={settings.withdraw_close_time}
                                        onChange={(e) => handleChange('withdraw_close_time', e.target.value)}
                                        className="[color-scheme:dark] h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
