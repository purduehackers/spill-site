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
            className="flex flex-row"
            aria-label={ariaLabel}
        >
            {options.map((option, index) => (
                <RadixToggleGroup.Item 
                    key={option.value}
                    value={option.value}
                    className={`
                        px-4 py-2 text-xs font-bold lowercase
                        border-y-2 border-coffee
                        ${index === 0 ? 'border-l-2 rounded-l-md' : 'border-l-0'}
                        ${index === options.length - 1 ? 'border-r-2 rounded-r-md' : 'border-r-0'}
                        bg-coffee-light text-paper
                        transition-all duration-100
                        hover:bg-coffee
                        cursor-pointer
                        ${option.className || ''}
                        [&[data-state=on]]:bg-coffee [&[data-state=on]]:text-paper
                    `}
                >
                    {option.label || option.value}
                </RadixToggleGroup.Item>
            ))}
        </RadixToggleGroup.Root>
    );
}

