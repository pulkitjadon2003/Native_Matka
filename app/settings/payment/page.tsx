import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PaymentSettings() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight">Payment Configuration</h2>
                            <Button>Save Changes</Button>
                        </div>

                        {/* UPI Settings */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                                <h3 className="text-lg font-bold text-white">UPI & QR Code</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>UPI ID</Label>
                                    <Input placeholder="merchant@upi" defaultValue="shreematka@upi" />
                                </div>
                                <div className="space-y-2">
                                    <Label>UPI Number / Phone</Label>
                                    <Input placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>QR Code Image</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="h-32 w-32 border-2 border-dashed border-border-dark rounded-lg flex items-center justify-center bg-surface-dark/50 p-2">
                                            <span className="material-symbols-outlined text-text-secondary text-4xl">add_photo_alternate</span>
                                        </div>
                                        <div className="space-y-2">
                                            <Button variant="secondary" size="sm">Upload New QR</Button>
                                            <p className="text-xs text-text-secondary">Recommended size: 500x500px. JPG, PNG only.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Bank Details */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">account_balance</span>
                                <h3 className="text-lg font-bold text-white">Bank Account Details</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Account Holder Name</Label>
                                    <Input placeholder="Enter name" defaultValue="Shree Matka Enterprise" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input placeholder="e.g. HDFC Bank" defaultValue="HDFC Bank" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input type="password" placeholder="Enter account no" defaultValue="123456789012" />
                                </div>
                                <div className="space-y-2">
                                    <Label>IFSC Code</Label>
                                    <Input placeholder="HDFC0001234" defaultValue="HDFC0001234" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
