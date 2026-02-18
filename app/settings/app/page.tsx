import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AppSettings() {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight">App Configuration</h2>
                            <Button>Save Changes</Button>
                        </div>

                        {/* General Settings */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h3 className="text-lg font-bold text-white">General Settings</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Admin UPI ID</Label>
                                    <Input placeholder="admin@upi" defaultValue="matkaadmin@upi" />
                                    <p className="text-xs text-text-secondary">Default UPI ID for receiving payments</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Joining Bonus (₹)</Label>
                                    <Input type="number" placeholder="0" defaultValue="50" />
                                </div>
                            </div>
                        </Card>

                        {/* Limits */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">payments</span>
                                <h3 className="text-lg font-bold text-white">Transaction Limits</h3>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Min Deposit Amount (₹)</Label>
                                    <Input type="number" defaultValue="500" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Deposit Amount (₹)</Label>
                                    <Input type="number" defaultValue="100000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Withdrawal Amount (₹)</Label>
                                    <Input type="number" defaultValue="1000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Withdrawal Amount (₹)</Label>
                                    <Input type="number" defaultValue="50000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Bid Amount (₹)</Label>
                                    <Input type="number" defaultValue="10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Bid Amount (₹)</Label>
                                    <Input type="number" defaultValue="10000" />
                                </div>
                            </div>
                        </Card>

                        {/* Timing Settings */}
                        <Card className="p-6 space-y-6">
                            <div className="flex items-center gap-2 border-b border-border-dark pb-4">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <h3 className="text-lg font-bold text-white">Operational Timings</h3>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Withdraw Open Time</Label>
                                    <Input type="time" defaultValue="10:00" className="[color-scheme:dark]" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Withdraw Close Time</Label>
                                    <Input type="time" defaultValue="18:00" className="[color-scheme:dark]" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
