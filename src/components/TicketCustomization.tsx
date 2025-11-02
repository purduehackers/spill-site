import { useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';

import ColorSelector from './ColorSelector';
import Draggable from './Draggable';
import Ticket from './Ticket';
import ToggleGroup from './ToggleGroup';
import Select from './Select';
import { ticketDesigns } from '@/data/ticketDesigns';

export default function TicketCustomization() {
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    const [name, setName] = useState<string>('');
    const [number, setNumber] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const [ticketOrientation, setTicketOrientation] = useState<string>('landscape');
    const [ticketDesign, setTicketDesign] = useState<string>('/img/tickets/landscape/green/matcha-latte.png');
    const [ticketColor, setTicketColor] = useState<string>('green');
    const [backgroundColor, setBackgroundColor] = useState<string>('paper');

    // Load name, number, and message from localStorage
    useEffect(() => {
        const name = localStorage.getItem('ticket-name') || '';
        if (name.length > 12) {
            setName(name.slice(0, 12));
        } else {
            setName(name);
        }
        setNumber(localStorage.getItem('ticket-number') || 'HAK');
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

    const handleTicketDesignChange = (filename: string) => {
        const filePath = `/img/tickets/${ticketOrientation}/${ticketColor}/${filename}`;
        console.log(filePath);
        setTicketDesign(filePath);
    }

    const handleTicketColorChange = (color: string) => {
        // Convert ticket color (tea/coffee) to path color (green/brown)
        const pathColor = color === 'tea' ? 'green' : 'brown';
        setTicketColor(pathColor);
        
        // Update ticket design to first available design for the new color
        const designs = ticketDesigns[ticketOrientation as keyof typeof ticketDesigns]?.[pathColor];
        if (designs && designs.length > 0) {
            const filePath = `/img/tickets/${ticketOrientation}/${pathColor}/${designs[0].filename}`;
            setTicketDesign(filePath);
        }
    }

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
    }

    const handleTicketOrientationChange = (orientation: string) => {
        setTicketOrientation(orientation);
        // Update ticket design to first available design for the new orientation
        const designs = ticketDesigns[orientation as keyof typeof ticketDesigns]?.[ticketColor as 'green' | 'brown'];
        if (designs && designs.length > 0) {
            const filePath = `/img/tickets/${orientation}/${ticketColor}/${designs[0].filename}`;
            setTicketDesign(filePath);
        }
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

    const downloadTicket2 = async () => {
        const node = document.getElementById('ticket-customization-canvas');
        if (!node) return;

        // Enter export mode: neutralize heavy effects that can break iOS captures
        //node.classList.add('exporting');

        try {
            const width = node.clientWidth;
            const height = node.clientHeight;
            const pixelRatio = Math.min(2, (window.devicePixelRatio || 1));
            const backgroundColor = getComputedStyle(node).backgroundColor || '#ffffff';

            const dataUrl = await htmlToImage.toPng(node, {
                pixelRatio,
                width,
                height,
                backgroundColor,
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'ticket.png';
            link.click();
        } finally {
            // Exit export mode
            node.classList.remove('exporting');
        }
    }

    const shareTicket = () => {
        
    }

    const resetTicket = () => {
        setTicketOrientation('portrait');
        setTicketColor('green');
        setTicketDesign('/img/tickets/portrait/green/matcha.png');
    }

    return (
        <div className="w-full h-fit mx-auto flex flex-col md:flex-row gap-4 justify-center"  
            style={{
                '--preview-size-small': '80px',
                '--preview-size-medium': '500px',
                '--preview-size-large': '520px',
            } as React.CSSProperties}
        >
            {/* Options Panel */}
            <div className="w-full md:w-[40%] h-fit md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] flex flex-col gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
                <div className="flex flex-row justify-between">
                    <div className="text-moss">
                        ≋ create your ticket ಃ
                    </div>
                    <div className="text-moss">
                        #{number.padStart(3, '0')}
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    {/* Name and Message */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold lowercase" 
                                htmlFor="name">
                            Name
                        </label>
                        <input className="border-b-2 border-dotted border-coffee-light"
                            id="name"
                            type="text"
                            maxLength={12}
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
                            placeholder="join me at spill 2025!!"
                            value={message}
                            onChange={(e) => handleMessageChange(e.target.value)}
                        />
                    </div>

                    {/* Ticket Design */}
                    <div className="flex flex-row md:flex-col gap-4 md:gap-4">
                        <div className="flex gap-4">
                            {/* Orientation */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold lowercase" htmlFor="ticket-orientation">Orientation</label>
                                <ToggleGroup 
                                    value={ticketOrientation}
                                    onValueChange={handleTicketOrientationChange}
                                    options={[
                                        { value: 'portrait', label: '||', className: 'bg-coffee-light' },
                                        { value: 'landscape', label: '=', className: 'bg-coffee-light' }
                                    ]}
                                    required={true}
                                    ariaLabel="Ticket orientation"
                                />
                            </div>

                            {/* Color */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold lowercase" htmlFor="ticket-type">Flavor</label>
                                <ToggleGroup 
                                    value={ticketColor === 'green' ? 'tea' : 'coffee'}
                                    onValueChange={handleTicketColorChange}
                                    options={[
                                        { value: 'tea', label: 'tea', className: 'bg-matcha' },
                                        { value: 'coffee', label: 'coffee', className: 'bg-coffee-light' }
                                    ]}
                                    required={true}
                                    ariaLabel="Ticket type"
                                />
                            </div>
                        </div>

                        {/* Design */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold lowercase" htmlFor="ticket-design">
                                Design
                            </label>
                            <Select
                                id="ticket-design"
                                value={ticketDesign.split('/').pop() || ''}
                                onValueChange={handleTicketDesignChange}
                                options={ticketDesigns[ticketOrientation as keyof typeof ticketDesigns]?.[ticketColor as 'green' | 'brown']?.map((design) => ({
                                    value: design.filename,
                                    label: design.name
                                })) || []}
                                ariaLabel="Ticket design"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold lowercase" htmlFor="ticket-color">Background Color</label>
                            <ColorSelector colors={['paper', 'moss', 'coffee-light', 'sage', 'matcha', 'cream', 'chocolate']} 
                                handleColorChange={handleBackgroundColorChange} />
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-2">
                    <button className="form-button"
                        onClick={downloadTicket}
                    >
                        download
                    </button>
                    {/*<button className="form-button"
                        onClick={shareTicket}
                    >
                        share
                    </button>
                    <button className="form-button"
                        onClick={resetTicket}
                    >
                        reset
                    </button>*/}
                </div>
            </div>

            {/* Ticket Customization Preview Canvas */}
            <div id="ticket-customization-canvas"
				className={`z-500 relative w-full md:w-[var(--preview-size-medium)] lg:w-[var(--preview-size-large)] h-140 sm:h-140 md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] 
                    overflow-hidden select-none flex flex-col gap-4 justify-between bg-${backgroundColor} border-2 border-sage/20 rounded-lg p-4`}
                onMouseMove={e => {
                    setMousePos({ x: e.clientX, y: e.clientY }); 
                }}
                onMouseEnter={e => {
                    setMousePos({ x: e.clientX, y: e.clientY }); 
                }}
                onMouseLeave={() => {
                    setMousePos(null);
                }}
            >
				{/* Grain overlay for preview canvas */}
				<div
					aria-hidden
					className="z-1000 pointer-events-none absolute inset-0 mix-blend-overlay opacity-100"
					style={{ backgroundImage: 'var(--grain-texture)', backgroundRepeat: 'repeat' }}
				/>

                {/* Event Info */}
                <div className="z-200 text-xs flex justify-between">
                    <div className="text-transparent realstic-marker-highlight">december 6, 2025</div>
                    <div>spill.purduehackers.com</div>
                </div>

                {/* Ticket */ }
                <div className="z-15 absolute inset-0 w-full h-full flex items-center justify-center">
                    <Ticket name={name} number={number} ticketDesign={ticketDesign} ticketColor={ticketColor} mousePos={mousePos} />
                </div>

                {/* Sticky NoteText Overlay */}
                <Draggable className="handle w-64 h-64 absolute inset-0 top-[40%] left-[60%] drop-shadow-lg cursor-grab active:cursor-grabbing"
                    zIndex={1}
                >
                    <img className="hue-rotate-15 absolute top-0 left-0 w-full h-full object-contain select-none"
                        src="/img/untidy-stack-yellow-sticky-post-notes-isolated-white.png" 
                        alt="sticky note" 
                        crossOrigin="anonymous" />
                    <div className="w-full h-full -rotate-15 flex items-center justify-center">
                        <div className="relative left-4 w-33 p-1 line-clamp-5 text-base text-coffee/80 font-nycd font-bold">
                            {message}
                        </div>
                    </div>
                </Draggable>

                {/* Coffee Cup */}
                <img src="/img/coffee-cup-1.jpg" 
                    alt="Ticket" 
                    className="hidden scale-215 absolute top-30 -left-20 w-200 h-full object-cover" 
                    crossOrigin="anonymous" />

                {/* Spills */}
                <div className="absolute inset-0 top-0 right-0">
                    <Draggable className="absolute -top-24 left-[58%] w-fit h-fit cursor-grab active:cursor-grabbing"
                        zIndex={0}
                    >
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/85.png`} 
                            alt="Spill"
                            crossOrigin="anonymous"/>
                    </Draggable>
                    <Draggable className="absolute -top-24 -left-45 w-fit h-fit cursor-grab active:cursor-grabbing"
                        zIndex={0}
                    >
                        <img className="handle w-64 h-full object-cover select-none"
                            src={`/img/coffee/89.png`} 
                            alt="Spill"
                            crossOrigin="anonymous" />
                    </Draggable>
                </div>

                {/* Regular Tea Tags */}
                <div className="flex flex-col gap-2 p-6 text-xs"
                    style={{
                        '--tea-tag-size': '0px',
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