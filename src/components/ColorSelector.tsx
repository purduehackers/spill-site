import { RadioGroup } from "radix-ui";

type TicketColor = "matcha" | "coffee";

export default function ColorSelector({ handleColorChange }: { handleColorChange: (color: TicketColor) => void }) {
    return (
        <RadioGroup.Root
            className="flex flex-row gap-2"
            aria-label="Ticket color"
            onValueChange={handleColorChange}
            defaultValue="matcha"
        >
            <RadioGroup.Item
                value="matcha"
                className="bg-matcha color-radio-item"
            >
                <RadioGroup.Indicator className="color-radio-indicator" />
            </RadioGroup.Item>
            <RadioGroup.Item
                value="coffee"
                className="bg-coffee-light color-radio-item"
            >
                <RadioGroup.Indicator className="color-radio-indicator" />
            </RadioGroup.Item>
        </RadioGroup.Root>
    )
}