import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function useIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

/**
 * Drop-in replacement for Select that renders a bottom Drawer on mobile.
 * Props mirror shadcn Select: value, onValueChange, placeholder, options=[{value, label}]
 */
export default function MobileSelect({ value, onValueChange, placeholder, options = [], className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm select-none",
          className
        )}
      >
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </button>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col pb-6 px-4 gap-1">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onValueChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full px-4 min-h-[52px] rounded-xl text-base font-medium transition-colors select-none",
                  o.value === value
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {o.label}
                {o.value === value && <Check className="w-4 h-4 text-violet-600" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}