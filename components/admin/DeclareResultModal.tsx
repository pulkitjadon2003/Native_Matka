"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
    const [success, setSuccess] = useState(false);

    // Preview state
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const calculateDigit = (panna: string) => {
        if (!panna || panna.length !== 3 || panna === '***') return "";
        try {
            const sum = panna.split('').reduce((acc, curr) => acc + parseInt(curr), 0);
            if (isNaN(sum)) return "";
            return (sum % 10).toString();
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (openPanna && openPanna.length === 3 && openPanna !== '***') {
            setOpenDigit(calculateDigit(openPanna));
        } else if (openPanna.length > 0 && openPanna.length < 3) {
            setOpenDigit("");
        }
    }, [openPanna]);

    useEffect(() => {
        if (closePanna && closePanna.length === 3 && closePanna !== '***') {
            setCloseDigit(calculateDigit(closePanna));
        } else if (closePanna.length > 0 && closePanna.length < 3) {
            setCloseDigit("");
        }
    }, [closePanna]);

    useEffect(() => {
        if (market && isOpen) {
            setOpenPanna(market.result?.open_panna === '***' ? '' : market.result?.open_panna || '');
            setOpenDigit(market.result?.open_digit === '*' ? '' : market.result?.open_digit || '');
            setClosePanna(market.result?.close_panna === '***' ? '' : market.result?.close_panna || '');
            setCloseDigit(market.result?.close_digit === '*' ? '' : market.result?.close_digit || '');
            setPreviewData(null);
            setError("");
            setSuccess(false);
        }
    }, [market, isOpen]);

    // Auto-fetch preview whenever inputs change (debounced)
    const fetchPreview = useCallback(async (op: string, od: string, cp: string, cd: string) => {
        if (!market?._id) return;
        // Only fetch if at least one field has a value
        const hasInput = op || od || cp || cd;
        if (!hasInput) {
            setPreviewData(null);
            return;
        }

        setPreviewLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/markets/preview-winners`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    game_id: market._id,
                    result: {
                        open_panna: op || '***',
                        open_digit: od || '*',
                        close_panna: cp || '***',
                        close_digit: cd || '*',
                    }
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setPreviewData(data.data);
            }
        } catch (err) {
            // Silently fail for auto-preview
        } finally {
            setPreviewLoading(false);
        }
    }, [market]);

    // Trigger debounced preview on any input change
    useEffect(() => {
        if (!isOpen) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchPreview(openPanna, openDigit, closePanna, closeDigit);
        }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [openPanna, openDigit, closePanna, closeDigit, isOpen, fetchPreview]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/markets/${market._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
            if (!res.ok) throw new Error(data.message || "Failed to update result");

            setSuccess(true);
            onSuccess();
            setTimeout(() => onClose(), 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getResultDisplay = () => {
        return `${openPanna || '***'}-${openDigit || '*'}${closeDigit || '*'}-${closePanna || '***'}`;
    };

    // Success View
    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="bg-surface-dark border-border-dark text-white sm:max-w-md p-5 gap-3">
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="size-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center animate-in zoom-in-50 duration-300">
                            <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Result Declared!</h3>
                        <p className="text-text-secondary text-sm text-center">
                            Result for <span className="text-white font-bold">{market?.name}</span> has been saved.
                        </p>
                        <div className="bg-background-dark rounded-lg border border-border-dark px-4 py-3 w-full text-center">
                            <p className="text-3xl font-black font-mono text-primary tracking-widest">{getResultDisplay()}</p>
                        </div>
                        {previewData && previewData.total_winners > 0 && (
                            <div className="flex gap-4 w-full">
                                <div className="flex-1 bg-background-dark rounded-lg border border-border-dark p-3 text-center">
                                    <p className="text-xs text-text-secondary font-semibold">Winners</p>
                                    <p className="text-xl font-black">{previewData.total_winners}</p>
                                </div>
                                <div className="flex-1 bg-background-dark rounded-lg border border-border-dark p-3 text-center">
                                    <p className="text-xs text-text-secondary font-semibold">Payout</p>
                                    <p className="text-xl font-black text-success">₹{previewData.total_payout.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-surface-dark border-border-dark text-white sm:max-w-lg p-5 gap-3">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">emoji_events</span>
                        Declare Result - {market?.name}
                    </DialogTitle>
                </DialogHeader>

                <form id="declare-form" onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-text-secondary text-[10px] uppercase tracking-wider font-bold">Open Panna</Label>
                            <Input
                                placeholder="***"
                                value={openPanna}
                                onChange={(e) => setOpenPanna(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-background-dark border-border-dark focus:border-primary text-center font-mono text-lg h-10"
                                maxLength={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-text-secondary text-[10px] uppercase tracking-wider font-bold">Open Digit</Label>
                            <Input
                                placeholder="*"
                                value={openDigit}
                                onChange={(e) => setOpenDigit(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-background-dark border-border-dark focus:border-primary text-center font-black text-xl h-10"
                                maxLength={1}
                                readOnly={openPanna.length === 3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-text-secondary text-[10px] uppercase tracking-wider font-bold">Close Panna</Label>
                            <Input
                                placeholder="***"
                                value={closePanna}
                                onChange={(e) => setClosePanna(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-background-dark border-border-dark focus:border-primary text-center font-mono text-lg h-10"
                                maxLength={3}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-text-secondary text-[10px] uppercase tracking-wider font-bold">Close Digit</Label>
                            <Input
                                placeholder="*"
                                value={closeDigit}
                                onChange={(e) => setCloseDigit(e.target.value.replace(/[^0-9]/g, ''))}
                                className="bg-background-dark border-border-dark focus:border-primary text-center font-black text-xl h-10"
                                maxLength={1}
                                readOnly={closePanna.length === 3}
                            />
                        </div>
                    </div>

                    {/* Live result string */}
                    <div className="bg-background-dark rounded-lg border border-border-dark px-3 py-2 text-center">
                        <p className="text-xl font-black font-mono text-primary tracking-[0.15em]">{getResultDisplay()}</p>
                    </div>
                </form>

                {/* Auto Preview Section */}
                <div className="bg-background-dark rounded-lg border border-white/5 overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-primary">visibility</span>
                            Winner Preview
                        </span>
                        {previewLoading && <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>}
                    </div>

                    <div className="flex border-b border-white/5">
                        <div className="flex-1 px-3 py-2 text-center border-r border-white/5">
                            <p className="text-[10px] text-text-secondary uppercase font-semibold">Winners</p>
                            <p className="text-lg font-black">{previewData ? previewData.total_winners : '—'}</p>
                        </div>
                        <div className="flex-1 px-3 py-2 text-center">
                            <p className="text-[10px] text-text-secondary uppercase font-semibold">Payout</p>
                            <p className="text-lg font-black text-success">₹{previewData ? previewData.total_payout.toLocaleString('en-IN') : '—'}</p>
                        </div>
                    </div>

                    {previewData && previewData.winners.length > 0 && (
                        <div className="max-h-40 overflow-y-auto p-2 space-y-1.5">
                            {previewData.winners.map((w: any, i: number) => (
                                <div key={i} className="bg-surface-dark rounded-md px-3 py-2 border border-border-dark flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-bold text-white">{w.user_name}</span>
                                        <span className="text-text-secondary text-xs ml-2">{w.user_mobile}</span>
                                        <Badge variant="outline" className="ml-2 text-[9px] px-1 py-0 h-3.5 bg-primary/10 border-primary/20 text-primary uppercase">
                                            {w.bid_type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <span className="font-bold text-success whitespace-nowrap">+₹{w.win_amount}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {previewData && previewData.winners.length === 0 && (
                        <div className="px-3 py-4 text-center text-text-secondary text-xs flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-xl opacity-40">money_off</span>
                            No winners for this result
                        </div>
                    )}

                    {!previewData && !previewLoading && (
                        <div className="px-3 py-4 text-center text-text-secondary text-xs">
                            Enter digits to see potential winners
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-error bg-error/10 p-2.5 rounded-lg border border-error/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-sm">error</span>
                        {error}
                    </p>
                )}

                <DialogFooter className="flex gap-2 sm:justify-end border-t border-border-dark pt-3">
                    <Button type="button" variant="outline" onClick={onClose} className="border-border-dark hover:bg-white/5 hover:text-white rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="declare-form"
                        className="bg-primary hover:bg-primary/90 text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] rounded-xl px-6"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                                Declaring...
                            </span>
                        ) : "Declare & Payout"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
