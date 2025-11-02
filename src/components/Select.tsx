import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "@radix-ui/react-icons";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    ariaLabel?: string;
    className?: string;
}

export default function Select({
    value,
    onValueChange,
    options,
    placeholder = "Select...",
    disabled = false,
    required = false,
    name,
    id,
    ariaLabel,
    className = "",
}: SelectProps) {
    return (
        <SelectPrimitive.Root
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            required={required}
            name={name}
        >
            <SelectPrimitive.Trigger
                id={id}
                className={`inline-flex items-center justify-between px-2 py-1.5 text-sm font-bold bg-coffee text-white border-2 border-coffee-light rounded-md focus:outline-none focus:ring-2 focus:ring-coffee disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                aria-label={ariaLabel}
            >
                <SelectPrimitive.Value placeholder={placeholder}>
                    {options.find((opt) => opt.value === value)?.label || placeholder}
                </SelectPrimitive.Value>
                <SelectPrimitive.Icon className="ml-2">
                    <ChevronDownIcon className="w-4 h-4" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    className="overflow-hidden bg-paper border-2 border-coffee-light rounded-md shadow-lg z-50"
                    position="popper"
                    sideOffset={4}
                >
                    <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-coffee cursor-default">
                        <ChevronUpIcon className="w-4 h-4" />
                    </SelectPrimitive.ScrollUpButton>

                    <SelectPrimitive.Viewport className="p-1">
                        {options.map((option) => (
                            <SelectPrimitive.Item
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="relative flex items-center px-2 py-1.5 text-sm font-bold text-coffee rounded-sm cursor-pointer select-none outline-none hover:bg-coffee-light/20 focus:bg-coffee-light/20 data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                            >
                                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="w-6 inline-flex items-center justify-center">
                                    <CheckIcon className="w-4 h-4" />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>

                    <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-coffee cursor-default">
                        <ChevronDownIcon className="w-4 h-4" />
                    </SelectPrimitive.ScrollDownButton>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}

