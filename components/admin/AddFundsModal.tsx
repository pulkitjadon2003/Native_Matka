"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: { _id: string; name: string; mobile: string; wallet_balance: number } | null;
    onSuccess: () => void;
}

export function AddFundsModal({ isOpen, onClose, user, onSuccess }: AddFundsModalProps) {
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"credit" | "debit">("credit");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/users/${user?._id}/wallet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    type,
                    description,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update wallet");
            }

            onSuccess();
            onClose();
            // Reset form
            setAmount("");
            setDescription("");
            setType("credit");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-surface-dark border-border-dark text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Wallet</DialogTitle>
                </DialogHeader>

                <div className="mb-4 p-3 bg-background-dark rounded-lg flex justify-between items-center border border-border-dark">
                    <div>
                        <p className="text-xs text-text-secondary">User</p>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-text-secondary font-mono">{user.mobile}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-secondary">Current Balance</p>
                        <p className="text-xl font-bold text-primary">₹ {user.wallet_balance}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <RadioGroup
                            defaultValue="credit"
                            className="flex gap-4"
                            onValueChange={(v) => setType(v as "credit" | "debit")}
                        >
                            <div className="flex items-center space-x-2 border border-border-dark rounded-lg p-3 flex-1 cursor-pointer hover:bg-white/5 transition-colors has-[:checked]:border-success/50 has-[:checked]:bg-success/5">
                                <RadioGroupItem value="credit" id="credit" className="text-success border-success" />
                                <Label htmlFor="credit" className="cursor-pointer flex-1 text-success">Add Money</Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-border-dark rounded-lg p-3 flex-1 cursor-pointer hover:bg-white/5 transition-colors has-[:checked]:border-error/50 has-[:checked]:bg-error/5">
                                <RadioGroupItem value="debit" id="debit" className="text-error border-error" />
                                <Label htmlFor="debit" className="cursor-pointer flex-1 text-error">Deduct Money</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-background-dark border-border-dark focus:border-primary text-lg font-mono"
                            required
                            min="1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="Reason for adjustment"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background-dark border-border-dark focus:border-primary"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-error bg-error/10 p-2 rounded border border-error/20">
                            {error}
                        </p>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={type === 'credit' ? "bg-success hover:bg-success/90 text-black font-bold" : "bg-error hover:bg-error/90 text-white font-bold"}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : type === 'credit' ? "Add Funds" : "Deduct Funds"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
