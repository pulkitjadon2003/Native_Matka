"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils";

interface AddMarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any; // If provided, we are in "Edit" mode
}

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const periods = ['AM', 'PM'];

const DAYS = [
    { label: 'M', value: 'Mon' },
    { label: 'T', value: 'Tue' },
    { label: 'W', value: 'Wed' },
    { label: 'T', value: 'Thu' },
    { label: 'F', value: 'Fri' },
    { label: 'S', value: 'Sat' },
    { label: 'S', value: 'Sun' },
];

const TimePicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    // Parse existing value or default
    const [h, m, p] = value ? value.split(/[:\s]/) : ["10", "00", "AM"];

    const updateTime = (newH: string, newM: string, newP: string) => {
        onChange(`${newH}:${newM} ${newP}`);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2">
                <Select value={h} onValueChange={(val) => updateTime(val, m, p)}>
                    <SelectTrigger className="w-[70px] bg-background-dark border-border-dark">
                        <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-dark border-border-dark text-white max-h-[200px]">
                        {hours.map((hour) => (
                            <SelectItem key={hour} value={hour} className="focus:bg-white/10 hover:bg-white/10 cursor-pointer">{hour}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center text-xl">:</div>
                <Select value={m} onValueChange={(val) => updateTime(h, val, p)}>
                    <SelectTrigger className="w-[70px] bg-background-dark border-border-dark">
                        <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-dark border-border-dark text-white max-h-[200px]">
                        {minutes.map((minute) => (
                            <SelectItem key={minute} value={minute} className="focus:bg-white/10 hover:bg-white/10 cursor-pointer">{minute}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={p} onValueChange={(val) => updateTime(h, m, val)}>
                    <SelectTrigger className="w-[70px] bg-background-dark border-border-dark">
                        <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-dark border-border-dark text-white">
                        {periods.map((period) => (
                            <SelectItem key={period} value={period} className="focus:bg-white/10 hover:bg-white/10 cursor-pointer">{period}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export function AddMarketModal({ isOpen, onClose, onSuccess, initialData }: AddMarketModalProps) {
    const [name, setName] = useState("");
    const [openTime, setOpenTime] = useState("10:00 AM");
    const [closeTime, setCloseTime] = useState("02:00 PM");
    const [type, setType] = useState<"main" | "starline" | "gali_disawar">("main");
    const [daysOpen, setDaysOpen] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Initialize state when modal opens or initialData changes
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setOpenTime(initialData.open_time);
                setCloseTime(initialData.close_time);
                setType(initialData.type);
                setDaysOpen(initialData.days_open || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
            } else {
                // Reset for "Add" mode
                setName("");
                setOpenTime("10:00 AM");
                setCloseTime("02:00 PM");
                setType("main");
                setDaysOpen(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
            }
            setError("");
        }
    }, [isOpen, initialData]);

    const toggleDay = (day: string) => {
        setDaysOpen(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const url = initialData ? `/api/markets/${initialData._id}` : "/api/markets";
            const method = initialData ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    open_time: openTime,
                    close_time: closeTime,
                    type,
                    days_open: daysOpen,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to save market");
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
                    <DialogTitle>{initialData ? "Edit Bazar" : "Add New Bazar"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Bazar Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Milan Day"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background-dark border-border-dark focus:border-primary"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TimePicker
                            label="Open Time"
                            value={openTime}
                            onChange={setOpenTime}
                        />
                        <TimePicker
                            label="Close Time"
                            value={closeTime}
                            onChange={setCloseTime}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Days Open</Label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day, idx) => {
                                const isSelected = daysOpen.includes(day.value);
                                return (
                                    <button
                                        key={day.value + idx}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors border",
                                            isSelected
                                                ? "bg-primary text-black border-primary"
                                                : "bg-transparent text-text-secondary border-border-dark hover:border-primary/50 hover:text-white"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Market Type</Label>
                        <RadioGroup
                            defaultValue="main"
                            value={type}
                            className="flex gap-2"
                            onValueChange={(v: string) => setType(v as "main" | "starline" | "gali_disawar")}
                        >
                            <div className="flex items-center space-x-2 border border-border-dark rounded-lg p-2 flex-1 cursor-pointer hover:bg-white/5 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="main" id="main" className="text-primary border-primary" />
                                <Label htmlFor="main" className="cursor-pointer flex-1 text-xs">Main</Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-border-dark rounded-lg p-2 flex-1 cursor-pointer hover:bg-white/5 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="starline" id="starline" className="text-primary border-primary" />
                                <Label htmlFor="starline" className="cursor-pointer flex-1 text-xs">Starline</Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-border-dark rounded-lg p-2 flex-1 cursor-pointer hover:bg-white/5 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                                <RadioGroupItem value="gali_disawar" id="gali" className="text-primary border-primary" />
                                <Label htmlFor="gali" className="cursor-pointer flex-1 text-xs">Gali DS</Label>
                            </div>
                        </RadioGroup>
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
                            {loading ? "Saving..." : (initialData ? "Update Bazar" : "Create Bazar")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
