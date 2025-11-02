import * as React from "react";
import { ToggleGroup as RadixToggleGroup } from "radix-ui";

export interface ToggleOption {
    value: string;
    label?: string;
    className?: string;
}

interface ToggleGroupProps {
    value: string;
    onValueChange: (value: string) => void;
    options: ToggleOption[];
    required?: boolean; // Ensures one option is always selected
    ariaLabel?: string;
}

export default function ToggleGroup({ 
    value, 
    onValueChange, 
    options,
    required = false,
    ariaLabel = "Toggle options"
}: ToggleGroupProps) {
    return (
        <RadixToggleGroup.Root
            type="single"
            value={value}
            onValueChange={(newValue) => {
                if (newValue) {
                    onValueChange(newValue);
                } else if (!required) {
                    onValueChange('');
                }
            }}
            className="w-fit flex flex-row border-2 border-coffee-light rounded-md"
            aria-label={ariaLabel}
        >
            {options.map((option) => {
                const isActive = value === option.value;
                const customClass = isActive && option.className ? option.className : '';
                const defaultActiveClass = !option.className ? '[&[data-state=on]]:bg-coffee [&[data-state=on]]:text-paper' : '';
                
                return (
                    <RadixToggleGroup.Item 
                        key={option.value}
                        value={option.value}
                        className={`px-3 py-1 text-xs font-bold text-paper rounded-sm cursor-pointer ${customClass} ${defaultActiveClass}`.trim()}
                    >
                        {option.label || option.value}
                    </RadixToggleGroup.Item>
                );
            })}
        </RadixToggleGroup.Root>
    );
}

