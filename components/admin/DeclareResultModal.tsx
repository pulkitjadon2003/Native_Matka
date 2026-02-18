"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeclareResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    market: any;
}

export function DeclareResultModal({ isOpen, onClose, onSuccess, market }: DeclareResultModalProps) {
    const [openPanna, setOpenPanna] = useState("");
    const [openDigit, setOpenDigit] = useState("");
    const [closePanna, setClosePanna] = useState("");
    const [closeDigit, setCloseDigit] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const calculateDigit = (panna: string) => {
        if (!panna || panna.length !== 3 || panna === '***') return "";
        try {
            const sum = panna.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
            return (sum % 10).toString();
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (openPanna && openPanna.length === 3 && openPanna !== '***') {
            const digit = calculateDigit(openPanna);
            setOpenDigit(digit);
        }
    }, [openPanna]);

    useEffect(() => {
        if (closePanna && closePanna.length === 3 && closePanna !== '***') {
            const digit = calculateDigit(closePanna);
            setCloseDigit(digit);
        }
    }, [closePanna]);

    useEffect(() => {
        if (market) {
            setOpenPanna(market.result?.open_panna === '***' ? '' : market.result?.open_panna || '');
            setOpenDigit(market.result?.open_digit === '*' ? '' : market.result?.open_digit || '');
            setClosePanna(market.result?.close_panna === '***' ? '' : market.result?.close_panna || '');
            setCloseDigit(market.result?.close_digit === '*' ? '' : market.result?.close_digit || '');
        }
    }, [market]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/markets/${market._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    result: {
                        open_panna: openPanna || '***',
                        open_digit: openDigit || '*',
                        close_panna: closePanna || '***',
                        close_digit: closeDigit || '*',
                    }
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to update result");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-surface-dark border-border-dark text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Declare Result - {market?.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Open Panna</Label>
                            <Input
                                placeholder="***"
                                value={openPanna}
                                onChange={(e) => setOpenPanna(e.target.value)}
                                className="bg-background-dark border-border-dark focus:border-primary"
                                maxLength={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Open Digit</Label>
                            <Input
                                placeholder="*"
                                value={openDigit}
                                onChange={(e) => setOpenDigit(e.target.value)}
                                className="bg-background-dark border-border-dark focus:border-primary"
                                maxLength={1}
                                readOnly={openPanna.length === 3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Close Panna</Label>
                            <Input
                                placeholder="***"
                                value={closePanna}
                                onChange={(e) => setClosePanna(e.target.value)}
                                className="bg-background-dark border-border-dark focus:border-primary"
                                maxLength={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Close Digit</Label>
                            <Input
                                placeholder="*"
                                value={closeDigit}
                                onChange={(e) => setCloseDigit(e.target.value)}
                                className="bg-background-dark border-border-dark focus:border-primary"
                                maxLength={1}
                                readOnly={closePanna.length === 3}
                            />
                        </div>
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
                            className="bg-primary hover:bg-primary/90 text-black font-bold"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Result"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
