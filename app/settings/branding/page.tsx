import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function BrandingSettings() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight">App Branding & Content</h2>
                            <Button>Save Changes</Button>
                        </div>

                        {/* App Information */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">branding_watermark</span>
                                <h3 className="text-lg font-bold text-white">App Information</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>App Name</Label>
                                    <Input placeholder="Enter app name" defaultValue="Native Matka" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Phone Number</Label>
                                    <Input placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input placeholder="support@matka.com" defaultValue="support@matka.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <Input placeholder="https://matka.com" defaultValue="https://matka.com" />
                                </div>
                            </div>
                        </Card>

                        {/* Social Links */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">share</span>
                                <h3 className="text-lg font-bold text-white">Social Media Links</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>WhatsApp Link</Label>
                                    <Input placeholder="https://wa.me/..." defaultValue="https://wa.me/919876543210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telegram Channel</Label>
                                    <Input placeholder="https://t.me/..." defaultValue="https://t.me/matkachannel" />
                                </div>
                            </div>
                        </Card>

                        {/* Policies */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">gavel</span>
                                <h3 className="text-lg font-bold text-white">Legal & Policies</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Privacy Policy URL</Label>
                                    <Input placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Terms & Conditions URL</Label>
                                    <Input placeholder="https://..." />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
