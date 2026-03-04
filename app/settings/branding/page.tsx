"use client";

import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function BrandingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        app_name: 'Native Matka',
        contact_details: {
            whatsapp_no: '',
            mobile_1: '',
            email_1: '',
            telegram: ''
        },
        app_link: '',
        privacy_policy_url: '',
        terms_conditions_url: ''
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
                    ...data.data,
                    contact_details: {
                        ...settings.contact_details,
                        ...(data.data.contact_details || {})
                    }
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

    const handleContactChange = (field: string, value: string) => {
        setSettings((prev: any) => ({
            ...prev,
            contact_details: {
                ...prev.contact_details,
                [field]: value
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
                                    <span className="material-symbols-outlined text-primary text-4xl">branding_watermark</span>
                                    App Branding & Content
                                </h2>
                                <p className="text-sm font-medium text-text-secondary tracking-wide">Manage core visual identity, contact links, and legal policies.</p>
                            </div>
                            <Button onClick={handleSave} disabled={saving} className="font-bold text-black border-2 border-primary/20 hover:border-primary transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] z-10 h-12 px-8 rounded-xl bg-primary">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                        {/* App Information */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">phone_iphone</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">App Information</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Core Identity Details</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">App Name</Label>
                                    <Input
                                        placeholder="Enter app name"
                                        value={settings.app_name}
                                        onChange={(e) => handleChange('app_name', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Support Phone Number</Label>
                                    <Input
                                        placeholder="+91 98765 43210"
                                        value={settings.contact_details.mobile_1}
                                        onChange={(e) => handleContactChange('mobile_1', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Support Email</Label>
                                    <Input
                                        placeholder="support@matka.com"
                                        value={settings.contact_details.email_1}
                                        onChange={(e) => handleContactChange('email_1', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Website URL / App Link</Label>
                                    <Input
                                        placeholder="https://matka.com"
                                        value={settings.app_link}
                                        onChange={(e) => handleChange('app_link', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Social Links */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">share</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">Social Media Links</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">External Community Channels</p>
                                </div>
                            </div>

                            <div className="grid gap-8 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                                        WhatsApp Number
                                    </Label>
                                    <Input
                                        placeholder="919876543210"
                                        value={settings.contact_details.whatsapp_no}
                                        onChange={(e) => handleContactChange('whatsapp_no', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                                        Telegram Channel
                                    </Label>
                                    <Input
                                        placeholder="https://t.me/..."
                                        value={settings.contact_details.telegram}
                                        onChange={(e) => handleContactChange('telegram', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Policies */}
                        <Card className="p-6 md:p-8 space-y-8 bg-surface-dark border-border-dark rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 border-b border-border-dark pb-6">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="material-symbols-outlined text-primary">gavel</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-wide">Legal & Policies</h3>
                                    <p className="text-xs text-text-secondary font-medium tracking-wider uppercase mt-1">Compliance Documents</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Privacy Policy URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={settings.privacy_policy_url}
                                        onChange={(e) => handleChange('privacy_policy_url', e.target.value)}
                                        className="h-12 bg-background-dark border-border-dark focus-visible:ring-primary/50 focus-visible:border-primary rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-text-secondary font-bold uppercase tracking-wider text-xs">Terms & Conditions URL</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={settings.terms_conditions_url}
                                        onChange={(e) => handleChange('terms_conditions_url', e.target.value)}
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
