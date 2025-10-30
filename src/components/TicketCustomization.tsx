import { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';

import ColorSelector from './ColorSelector';
import Draggable from './Draggable';
import Ticket from './Ticket';

export default function TicketCustomization() {
    const [name, setName] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const [ticketDesign, setTicketDesign] = useState<string>('1');
    const [ticketColor, setTicketColor] = useState<string>('matcha');
    const [backgroundColor, setBackgroundColor] = useState<string>('paper');
    const [spillImage, setSpillImage] = useState<string>('default');

    useEffect(() => {
        setName(localStorage.getItem('ticket-name') || '');
        setMessage(localStorage.getItem('ticket-message') || '');
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ticket-name', name);
        }
    }, [name]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ticket-message', message);
        }
    }, [message]);

    const handleNameChange = (name: string) => {
        setName(name);
    }

    const handleMessageChange = (message: string) => {
        setMessage(message);
    }

    const handleTicketDesignChange = (design: string) => {
        setTicketDesign(design);
    }

    const handleTicketColorChange = (color: string) => {
        setTicketColor(color);
    }

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
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
        setTicketColor('matcha');
        setSpillImage('default');
    }

    return (
        <div className="w-fit h-fit mx-auto flex flex-col md:flex-row gap-4 justify-center"  
            style={{
                '--preview-size-small': '80px',
                '--preview-size-medium': '400px',
                '--preview-size-large': '520px',
            } as React.CSSProperties}
        >
            {/* Options Panel */}
            <div className="w-full md:w-1/2 md:max-w-fit h-fit md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] flex flex-col gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
                <div className="text-moss">
                    ≋ create your ticket ಀ ಃ
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold lowercase" 
                                htmlFor="name">
                            Name
                        </label>
                        <input className="border-b-2 border-dotted border-coffee-light"
                            id="name"
                            type="text"
                            placeholder="wack hacker"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                        />
                        <label className="text-xs font-bold lowercase" 
                                htmlFor="message">
                            Message
                        </label>
                        <input className="border-b-2 border-dotted border-coffee-light"
                            id="message"
                            type="text"
                            placeholder="come spill with us!!"
                            value={message}
                            onChange={(e) => handleMessageChange(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-row md:flex-col gap-4 md:gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold lowercase" htmlFor="ticket-color">Ticket Color</label>
                            <ColorSelector colors={['matcha', 'coffee-light']} 
                                handleColorChange={handleTicketColorChange} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold lowercase" htmlFor="ticket-color">Background Color</label>
                            <ColorSelector colors={['paper', 'moss', 'coffee-light', 'sage', 'matcha', 'cream', 'chocolate']} 
                                handleColorChange={handleBackgroundColorChange} />
                        </div>
                    </div>

                    <div className="my-2">
                        <select value={ticketDesign} 
                            onChange={(e) => handleTicketDesignChange(e.target.value)}
                        >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
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
            <div id="ticket-customization-canvas"
				className={`z-500 relative w-full md:w-[var(--preview-size-medium)] lg:w-[var(--preview-size-large)] h-screen md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] 
                    overflow-hidden select-none flex flex-col gap-4 justify-between bg-${backgroundColor} border-2 border-sage/20 rounded-lg p-4`}
            >
				{/* Grain overlay for preview canvas */}
				<div
					aria-hidden
					className="z-1000 pointer-events-none absolute inset-0 mix-blend-overlay opacity-100"
					style={{ backgroundImage: 'var(--grain-texture)', backgroundRepeat: 'repeat' }}
				/>

                {/* Event Info */}
                <div className="text-xs flex justify-between">
                    <div className="text-transparent realstic-marker-highlight">december 6, 2025</div>
                    <div>https://spill.purduehackers.com</div>
                </div>

                {/* Ticket */ }
                <div className="absolute w-fit h-fit flex items-center justify-center">
                    <Ticket name={name} ticketDesign={ticketDesign} />
                </div>

                {/* Text Overlay */}
                <div className="w-full h-0 flex flex-col items-center justify-center">
                    <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing">
                        <span className="handle text-base font-bold">{message}</span>
                    </Draggable>
                </div>

                {/* Coffee Cup */}
                <img src="/img/coffee-cup-1.jpg" 
                    alt="Ticket" 
                    className="hidden scale-215 absolute top-30 -left-20 w-200 h-full object-cover" />

                {/* Spills */}
                <div className="relative top-0 right-0 h-0 flex justify-end">
                    <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing"
                        zIndex={0}
                    >
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/85.png`} 
                            alt="Spill" draggable={false} />
                    </Draggable>
                    <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing"
                        zIndex={0}
                    >
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/89.png`} 
                            alt="Spill" draggable={false} />
                    </Draggable>
                </div>

                {/* Regular Tea Tags */}
                <div className="flex flex-col gap-2 p-6 text-xs"
                    style={{
                        '--tea-tag-size': '48px',
                    } as React.CSSProperties}
                >
                    <div className="flex flex-row gap-2">
                        <Draggable className="relative top-0 left-0 w-fit h-fit cursor-grab active:cursor-grabbing">
                            <div className="handle tea-tag w-[var(--tea-tag-size)] h-[var(--tea-tag-size)]">
                                <div className="w-full h-full flex flex-col items-center justify-center">

                                </div>
                            </div>
                        </Draggable>
                        <div className="tea-tag w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-sage">
                            <div className="w-full h-full flex flex-col items-center justify-center">

                            </div>
                        </div>
                        <div className="tea-tag w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-coffee-light">
                            <div className="w-full h-full flex flex-col items-center justify-center">

                            </div>
                        </div>
                    </div>
                </div>

                {/* Octagon Tea Tags */}
                <div className="hidden flex flex-col gap-2 p-6"
                    style={{
                        '--tea-tag-size': '96px',
                    } as React.CSSProperties}
                >
                    <div className="flex flex-row gap-2">
                        <div className="tea-tag-oct w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-pine">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag-oct w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-red-clay">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <span>tea</span>
                                <span>tag!</span>
                            </div>
                        </div>
                        <div className="tea-tag-oct w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-coffee">
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