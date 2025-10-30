import { RadioGroup } from "radix-ui";

interface ColorSelectorProps {
    colors: string[];
    handleColorChange: (color: string) => void;
}

export default function ColorSelector({ colors, handleColorChange }: ColorSelectorProps) {
    return (
        <RadioGroup.Root
            className="flex flex-row gap-2"
            aria-label="Ticket color"
            onValueChange={handleColorChange}
            defaultValue={colors[0]}
        >
            <div className="w-0 h-0 bg-matcha bg-coffee-light bg-paper bg-moss bg-cream bg-chocolate bg-sage/50"></div>
            {colors.map((color) => (
                <RadioGroup.Item
                    key={color}
                    value={color}
                    className={`bg-${color} color-radio-item`}
                >
                    <RadioGroup.Indicator className="color-radio-indicator" />
                </RadioGroup.Item>
            ))}
        </RadioGroup.Root>
    )
}