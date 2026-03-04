"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";

export default function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        payment_settings: {
            upi_id: '',
            upi_number: '',
            qr_code: '',
            bank_details: {
                bank_name: '',
                account_number: '',
                ifsc_code: '',
                account_holder_name: ''
            }
        }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data) {
                setSettings((prev: any) => ({
                    ...data.data,
                    payment_settings: {
                        ...prev.payment_settings,
                        ...(data.data.payment_settings || {})
                    }
                }));
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                handleNestedChange('payment_settings', 'qr_code', data.url);
            } else {
                alert('File upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('File upload error');
        }
    };

    const handleNestedChange = (parent: string, field: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleBankChange = (field: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            payment_settings: {
                ...prev.payment_settings,
                bank_details: {
                    ...(prev.payment_settings?.bank_details || {}),
                    [field]: value
                }
            }
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

    const { payment_settings } = settings;

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
                                    <span className="material-symbols-outlined text-primary text-4xl">account_balance_wallet</span>
                                    Payment Configuration
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Configure UPI IDs, QR codes, and Bank details for users.</p>
                            </div>
                            <Button onClick={handleSave} disabled={saving} className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-8 rounded-xl bg-primary">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                        {/* UPI Settings */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">UPI & QR Code</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Digital Payment Methods</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">UPI ID</Label>
                                    <Input
                                        placeholder="merchant@upi"
                                        value={payment_settings?.upi_id || ''}
                                        onChange={(e) => handleNestedChange('payment_settings', 'upi_id', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">UPI Number / Phone</Label>
                                    <Input
                                        placeholder="+91 98765 43210"
                                        value={payment_settings?.upi_number || ''}
                                        onChange={(e) => handleNestedChange('payment_settings', 'upi_number', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">QR Code Image</Label>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-2">
                                        <div className="h-40 w-40 border-2 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-background-dark/50 p-3 overflow-hidden group hover:border-primary hover:bg-primary/5 transition-all">
                                            {payment_settings?.qr_code ? (
                                                <img src={payment_settings.qr_code} alt="QR Code" className="w-full h-full object-contain mix-blend-screen" />
                                            ) : (
                                                <span className="material-symbols-outlined text-text-secondary text-5xl group-hover:text-primary transition-colors">add_photo_alternate</span>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                            <Button variant="outline" className="h-12 px-6 rounded-xl border border-border-dark bg-background-dark hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-bold tracking-wide text-white" onClick={() => fileInputRef.current?.click()}>
                                                <span className="material-symbols-outlined text-[18px] mr-2">upload</span>
                                                Upload New QR
                                            </Button>
                                            <p className="text-xs font-medium text-text-secondary tracking-wide">Recommended size: 500x500px. JPG, PNG only.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bank Details */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">account_balance</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">Bank Account Details</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Traditional Wire Transfer</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Account Holder Name</Label>
                                    <Input
                                        placeholder="Enter name"
                                        value={payment_settings?.bank_details?.account_holder_name || ''}
                                        onChange={(e) => handleBankChange('account_holder_name', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Bank Name</Label>
                                    <Input
                                        placeholder="e.g. HDFC Bank"
                                        value={payment_settings?.bank_details?.bank_name || ''}
                                        onChange={(e) => handleBankChange('bank_name', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Account Number</Label>
                                    <Input
                                        placeholder="Enter account no"
                                        value={payment_settings?.bank_details?.account_number || ''}
                                        onChange={(e) => handleBankChange('account_number', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">IFSC Code</Label>
                                    <Input
                                        placeholder="HDFC0001234"
                                        value={payment_settings?.bank_details?.ifsc_code || ''}
                                        onChange={(e) => handleBankChange('ifsc_code', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
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
