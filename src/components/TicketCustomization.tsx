import { useState } from 'react';
import ColorSelector from './ColorSelector';

interface TicketCustomizationProps {
  name: string;
}

export default function TicketCustomization({ name }: TicketCustomizationProps) {

    const [ticketDesign, setTicketDesign] = useState<string>('1');
    const [ticketShape, setTicketShape] = useState<string>('circle');
    const [ticketColor, setTicketColor] = useState<string>('matcha');
    const [spillImage, setSpillImage] = useState<string>('default');

    const handleTicketDesignChange = (design: string) => {
        setTicketDesign(design);
    }

    const handleTicketShapeChange = (shape: string) => {
        setTicketShape(shape);
    }

    const handleTicketColorChange = (color: string) => {
        setTicketColor(color);
    }

    const handleSpillImageChange = (image: string) => {
        setSpillImage(image);
    }

    return (
        <div className="w-full h-full flex gap-4">
            <div className="w-1/3 h-full flex flex-col gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
                <div>
                        ಃ create your ticket ಀ
                </div>
                <div>
                    <input className=""
                        type="text"
                        placeholder="name"
                    />
                    <ColorSelector handleColorChange={handleTicketColorChange} />
                    <div>
                        <select value={ticketDesign} 
                            onChange={(e) => handleTicketDesignChange(e.target.value)}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div>
                        ticket design, shape, color
                    </div>
                    <div>
                        spill/stain image
                    </div>
                    <div>
                        tea tag doodle
                    </div>
                </div>
                <div className="flex flex-row gap-2">
                    <button className="form-button">download</button>
                    <button className="form-button">share</button>
                    <button className="form-button">reset</button>
                </div>
            </div>

            {/* Ticket Customization Preview Canvas */}
            <div className="grow h-full overflow-hidden flex flex-col gap-4 justify-between border-2 border-coffee rounded-lg p-4">
                <div>
                    hello friends
                </div>

                {/* Ticket */ }
                <div className="w-full h-full flex flex-col gap-2">
                    <img  className="w-2/3 h-full object-cover"
                        src={`/img/tickets/ticket${ticketDesign}.png`} 
                        alt="Ticket" />
                </div>

                <div className="flex flex-col gap-2 p-6">
                    <div className="flex flex-row gap-2">
                        <div className="tea-tag w-24 h-24">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag w-24 h-24 bg-sage">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag w-24 h-24 bg-coffee-light">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-6">
                    <div className="flex flex-row gap-2">
                        <div className="tea-tag-oct w-24 h-24 bg-pine">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag-oct w-24 h-24 bg-red-clay">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag-oct w-24 h-24 bg-coffee">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}