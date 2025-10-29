import { useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { toPng } from 'html-to-image';

import ColorSelector from './ColorSelector';
import Draggable from './Draggable';

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

    const downloadTicket = () => {
        const node = document.getElementById('ticket-customization-canvas');
        if (!node) return;
        
        htmlToImage.toPng(node).then((dataUrl) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'ticket.png';
            link.click();
        });
    }

    const shareTicket = () => {
        
    }

    const resetTicket = () => {
        setTicketDesign('1');
        setTicketShape('circle');
        setTicketColor('matcha');
        setSpillImage('default');
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
                    <button className="form-button"
                        onClick={downloadTicket}
                    >
                        download
                    </button>
                    <button className="form-button"
                        onClick={shareTicket}
                    >
                        share
                    </button>
                    <button className="form-button"
                        onClick={resetTicket}
                    >
                        reset
                    </button>
                </div>
            </div>

            {/* Ticket Customization Preview Canvas */}
            <div 
                id="ticket-customization-canvas"
                className="grow h-full overflow-hidden flex flex-col gap-4 justify-between bg-paper border-2 border-sage/50 rounded-lg p-4"
            >

                {/* Ticket */ }
                <div className="w-full h-full flex flex-col gap-2">
                    <img className="w-2/3 h-full object-cover"
                        src={`/img/tickets/ticket${ticketDesign}.png`} 
                        alt="Ticket" />
                </div>

                {/* Spills */}
                <div className="relative top-0 right-0 h-0 flex justify-end">
                    <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing">
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/85.png`} 
                            alt="Spill" draggable={false} />
                    </Draggable>
                    <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing">
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/89.png`} 
                            alt="Spill" draggable={false} />
                    </Draggable>
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