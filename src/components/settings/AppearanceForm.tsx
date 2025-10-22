
"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { useToast } from "@/hooks/use-toast"

function hexToHsl(hex: string): string {
    // Remove the leading #
    hex = hex.substring(1);

    // Convert hex to R, G, B
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find the minimum and maximum values to get saturation and lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    const hValue = Math.round(h * 360);
    const sValue = Math.round(s * 100);
    const lValue = Math.round(l * 100);

    return `${hValue} ${sValue}% ${lValue}%`;
}


function hslToHex(hsl: string): string {
    const [h, s, l] = hsl.split(' ').map((val, index) => {
        if (index === 0) return parseInt(val, 10);
        return parseInt(val.replace('%', ''), 10);
    });

    const sFraction = s / 100;
    const lFraction = l / 100;

    const c = (1 - Math.abs(2 * lFraction - 1)) * sFraction;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lFraction - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else if (h >= 300 && h < 360) {
        [r, g, b] = [c, 0, x];
    }

    const toHex = (c: number) => {
        const hex = Math.round((c + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export function AppearanceForm() {
    const { setTheme, theme } = useTheme();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [accentColor, setAccentColor] = useState('172 81% 40%'); // Default HSL for green

    useEffect(() => {
        setMounted(true);
        const storedAccent = localStorage.getItem('accent-color');
        if (storedAccent) {
            setAccentColor(storedAccent);
        }
        // Set initial accent color on load
        document.documentElement.style.setProperty('--accent', storedAccent || accentColor);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.style.setProperty('--accent', accentColor);
        }
    }, [accentColor, mounted]);
    
    const savePreferences = () => {
        localStorage.setItem('accent-color', accentColor);
        toast({
            title: "Preferences Saved",
            description: "Your appearance settings have been updated.",
        })
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(accentColor);
        toast({
            title: "Copied to Clipboard",
            description: `Copied HSL value: ${accentColor}`,
        });
    }

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const hex = event.target.value;
        const hsl = hexToHsl(hex);
        setAccentColor(hsl);
    };

    if (!mounted) {
        return null;
    }

    const colorPickerHex = hslToHex(accentColor);

    return (
      <div className="space-y-8">
         <div className="space-y-2">
          <Label>Theme</Label>
          <p className="text-sm text-muted-foreground">Select the theme for the dashboard.</p>
            <RadioGroup 
                defaultValue={theme}
                onValueChange={(value: "light" | "dark" | "system") => setTheme(value)} 
                className="grid max-w-md grid-cols-3 gap-8 pt-2"
            >
                <div>
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="light" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                    <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-2 w-4/5 rounded-lg bg-[#ecedef]" />
                        <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                        <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                        <div className="h-2 w-full rounded-lg bg-[#ecedef]" />
                        </div>
                    </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                    Light
                    </span>
                </Label>
                </div>
                <div>
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="dark" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                    <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                    </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                    Dark
                    </span>
                </Label>
                </div>
                 <div>
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="system" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                    <div className="space-y-2 rounded-sm bg-gradient-to-r from-white to-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-gradient-to-r from-slate-100 to-slate-800 p-2 shadow-sm">
                        <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-slate-100 to-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-slate-100 to-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-full rounded-lg bg-slate-400" />
                        </div>
                    </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                    System
                    </span>
                </Label>
                </div>
            </RadioGroup>
        </div>
        <div className="space-y-2">
            <Label>Accent Color</Label>
            <p className="text-sm text-muted-foreground">Select the accent color for the dashboard.</p>
            <div className="flex items-center gap-4 pt-2">
                <div className="relative">
                    <input 
                        type="color"
                        value={colorPickerHex}
                        onChange={handleColorChange}
                        className="h-10 w-14 rounded-md border-2 border-border p-1 cursor-pointer appearance-none bg-background"
                        style={{'--tw-shadow': `0 0 0 2px hsl(${accentColor})`, boxShadow: `0 0 0 2px hsl(${accentColor})`}}
                    />
                </div>
                <div className="relative max-w-xs flex-grow">
                    <Input readOnly value={accentColor} className="pr-10" />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
        <Button onClick={savePreferences}>Save preferences</Button>
      </div>
    )
  }
  

    