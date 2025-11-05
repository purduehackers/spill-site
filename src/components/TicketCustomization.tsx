import { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

import ColorSelector from './ColorSelector';
import Ticket from './Ticket';
import ToggleGroup from './ToggleGroup';
import Select from './Select';
import PaintCanvas from './PaintCanvas';
import Spinner from './Spinner';
import { SpinnerIcon, PencilIcon, TwitterIcon, DownloadIcon, ShareIcon } from './Icons';
import { ticketDesigns } from '@/data/ticketDesigns';

export default function TicketCustomization() {
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    const [name, setName] = useState<string>('');
    const [number, setNumber] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const [ticketOrientation, setTicketOrientation] = useState<string>('landscape');
    const [ticketDesign, setTicketDesign] = useState<string>('/img/tickets/landscape/green/matcha-latte.png');
    const [ticketColor, setTicketColor] = useState<string>('green');
    const [backgroundColor, setBackgroundColor] = useState<string>('moss');

    const [drawingActive, setDrawingActive] = useState<boolean>(false);
    const [drawingPaused, setDrawingPaused] = useState<boolean>(true);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const ticketContainerRef = useRef<HTMLDivElement>(null);
    const mobileTicketContainerRef = useRef<HTMLDivElement>(null);

    const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

    const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
    const [isLoadingTweet, setIsLoadingTweet] = useState<boolean>(false);
    const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false);
    const [isLoadingShare, setIsLoadingShare] = useState<boolean>(false);
    

    useEffect(() => {
        // Detect touch devices
        let touchDetected = false;
        if (typeof window !== 'undefined') {
            touchDetected =
                (navigator as any)?.maxTouchPoints > 0 ||
                // @ts-ignore - Safari/iOS support
                ('ontouchstart' in window) ||
                window.matchMedia('(pointer: coarse)').matches ||
                window.matchMedia('(hover: none)').matches;
            setIsTouchDevice(Boolean(touchDetected));
        }

        // Load name, number, and message from localStorage
        const name = localStorage.getItem('ticket-name') || '';
        if (name.length > 12) {
            setName(name.slice(0, 12));
        } else {
            setName(name);
        }
        setNumber(localStorage.getItem('ticket-number') || 'HAK');
        setMessage(localStorage.getItem('ticket-message') || '');
        
        // Done loading if not touch device
        if (!touchDetected) {
            setIsLoadingPage(false);
        }
    }, []);
    useEffect(() => {
        if (isTouchDevice) {
            // Ensure both orientation and ticket graphic update together on touch devices
            handleTicketOrientationChange('portrait');
        }
        
        setIsLoadingPage(false);
    }, [isTouchDevice]);
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


    const uploadTicket = async () => {
        try {
            if (!canvasContainerRef.current) {
                throw new Error('Canvas container not found');
            }

            // Generate PNG using html-to-image
            const dataUrl = await htmlToImage.toPng(canvasContainerRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#e0dbd3',
            });

            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'spill-ticket.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const uploadResponse = await fetch('/api/upload-ticket', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            const data = await uploadResponse.json();
            return { url: data.url, id: data.id };
        } catch (error) {
            console.error('Error uploading ticket:', error);
            return null;
        }
    }

    const downloadTicketDesign = async () => {
        try {
            if (!mobileTicketContainerRef.current) {
                throw new Error('Ticket container not found');
            }

            // Generate PNG using html-to-image
            const dataUrl = await htmlToImage.toPng(mobileTicketContainerRef.current, {
                quality: 1.0,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${name.replace(/ /g, "-")}_ticket-design.png`;
            link.click();
        } catch (error) {
            console.error('Error downloading ticket design:', error);
            alert('Failed to download ticket design');
        }
    }

    const downloadTicket = async () => {
        setIsLoadingDownload(true);
        try {
            if (!canvasContainerRef.current) {
                throw new Error('Canvas container not found');
            }

            // Generate PNG using html-to-image
            const dataUrl = await htmlToImage.toPng(canvasContainerRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#e0dbd3',
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${name.replace(/ /g, "-")}_spill-ticket.png`;
            link.click();
            
            // Also upload for sharing
            await uploadTicket();
        } catch (error) {
            console.error('Error downloading ticket:', error);
            alert('Failed to download ticket');
        } finally {
            setIsLoadingDownload(false);
        }
    }

    const shareTicket = async () => {
        setIsLoadingShare(true);
        try {
            if (!canvasContainerRef.current) {
                throw new Error('Canvas container not found');
            }

            const result = await uploadTicket();

            // Generate PNG using html-to-image
            const dataUrl = await htmlToImage.toPng(canvasContainerRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#e0dbd3',
            });

            // Convert data URL to blob and then to File
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'spill-ticket.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Spill 2025 Ticket',
                    text: result ? `Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!\n\nhttps://spill.purduehackers.com/tickets/${result.id}` : 'Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!'
                });
            } else {
                alert('Sharing is not supported on this device. Try the download button instead!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Unable to share. Try the download button instead!');
        } finally {
            setIsLoadingShare(false);
        }
    }

    if (isLoadingPage) {
        return (
            <div className="w-full h-fit mx-auto flex flex-col md:flex-row gap-4 justify-center">
                <div className="flex gap-4 justify-center items-center">
                    <Spinner className="h-8 w-8 text-matcha mb-2" icon={<SpinnerIcon className="h-8 w-8" />} />
                    <span className="text-matcha text-lg font-semibold">loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-fit mx-auto flex flex-col md:flex-row gap-4 justify-center"
            style={{
                '--preview-size-small': '80px',
                '--preview-size-medium': '500px',
                '--preview-size-large': '500px',
            } as React.CSSProperties}
        >
            {/* Options Panel */}
            <div className="w-full md:w-[40%] min-w-fit h-fit md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] flex flex-col justify-between gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
                <div>
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
                        <div className="flex flex-col gap-4 md:gap-4">
                            <div className="flex flex-row md:flex-col flex-wrap gap-2 md:gap-4">
                                <div className="flex flex-wrap gap-2 md:gap-4">
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
                                    <Select className="w-fit min-w-30"
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
                            </div>

                            {/* Color selector */}
                            <div className="flex flex-row flex-wrap items-end justify-between gap-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold lowercase" htmlFor="ticket-color">pencil</label>
                                    <ColorSelector colors={['moss', 'coffee-light', 'sage', 'matcha', 'cream', 'chocolate']}
                                        handleColorChange={handleBackgroundColorChange} />
                                </div>

                                <div className='flex gap-2 items-end justify-end'>
                                    <button className={`form-button px-1 py-1 flex items-center gap-2 border-2
                                            ${drawingActive && !drawingPaused ? 'bg-matcha border-paper' : 'bg-coffee border-coffee-light text-moss'}`}
                                        onClick={() => {
                                            if (!drawingActive) {
                                                setDrawingActive(true);
                                                setDrawingPaused(false);
                                            } else {
                                                setDrawingPaused(prev => !prev);
                                            }
                                        }}
                                        aria-label="Toggle drawing"
                                        id="ticket-canvas-draw-toggle"
                                        title="Draw"
                                    >
                                        <PencilIcon className="inline-block w-[18px] h-[18px]" />
                                    </button>

                                    <button className="form-button px-2 py-1 bg-red-clay text-paper flex items-center gap-2 border-solid border-2 border-coffee-light"
                                        onClick={() => setDrawingActive(false)}
                                        aria-label="Clear canvas"
                                        id="ticket-canvas-clear"
                                        title="Clear drawing"
                                    >
                                        <span>clear</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-paper text-coffee px-4 py-2 rounded-lg border-2 border-coffee"
                            onClick={async () => {
                                setIsLoadingTweet(true);
                                try {
                                const result = await uploadTicket();
                                const tweetText = result
                                    ? `Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!\n\nhttps://spill.purduehackers.com/tickets/${result.id}`
                                    : 'Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!';
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                                } finally {
                                    setIsLoadingTweet(false);
                                }
                            }}>
                            {isLoadingTweet ? (
                                <Spinner className="w-5 h-5" icon={<SpinnerIcon className="w-5 h-5" />} />
                            ) : (
                                <TwitterIcon className="w-5 h-5" />
                            )}
                            tweet
                        </button>

                        <button
                            onClick={downloadTicket}
                            className="flex-1 flex items-center justify-center gap-2 bg-paper text-coffee px-4 py-2 rounded-lg border-2 border-coffee">
                            {isLoadingDownload ? (
                                <Spinner className="w-5 h-5" icon={<SpinnerIcon className="w-5 h-5" />} />
                            ) : (
                                <DownloadIcon className="w-5 h-5" />
                            )}
                            download
                        </button>
                    </div>

                    <button
                        onClick={shareTicket}
                        className="w-full flex items-center justify-center gap-2 bg-matcha text-paper px-4 py-2 rounded-lg">
                        {isLoadingShare ? (
                            <Spinner className="w-5 h-5" icon={<SpinnerIcon className="w-5 h-5" />} />
                        ) : (
                            <ShareIcon className="w-5 h-5" />
                        )}
                        share
                    </button>

                    {/* Test button for downloading ticket design */}
                    <button
                        onClick={downloadTicketDesign}
                        className="w-full flex items-center justify-center gap-2 bg-sage text-paper px-4 py-2 rounded-lg border-2 border-coffee-light">
                        <DownloadIcon className="w-5 h-5" />
                        download ticket
                    </button>
                </div>
            </div>

            {/* Ticket Customization Preview Canvas */}
            <div id="ticket-customization-canvas"
                ref={canvasContainerRef}
                className="hidden z-500 relative w-full md:w-[var(--preview-size-medium)] lg:w-[calc(var(--preview-size-large)_+_120px)] h-140 sm:h-140 md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)]
                            overflow-hidden select-none flex flex-col gap-4 justify-between bg-paper border-2 border-sage/20 rounded-lg p-4"
                onMouseMove={e => {
                    if (!drawingActive || drawingPaused) {
                        setMousePos({ x: e.clientX, y: e.clientY });
                    } else {
                        setMousePos(null);
                    }
                }}
                onMouseEnter={e => {
                    if (!drawingActive || drawingPaused) {
                        setMousePos({ x: e.clientX, y: e.clientY });
                    } else {
                        setMousePos(null);
                    }
                }}
                onMouseLeave={() => {
                    setMousePos(null);
                }}
            >
                {/* Drawing canvas overlay */}
                <div className={`z-[610] absolute inset-0 w-full h-full ${drawingActive ? '' : 'pointer-events-none'}`}>
                    <PaintCanvas
                        strokeColor={backgroundColor}
                        containerRef={canvasContainerRef}
                        active={drawingActive}
                        paused={drawingPaused}
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
                {/* Grain overlay for preview canvas */}
                <div
                    aria-hidden
                    className="z-1000 pointer-events-none absolute inset-0 mix-blend-overlay opacity-100"
                    style={{ backgroundImage: 'var(--grain-texture)', backgroundRepeat: 'repeat' }}
                />

                {/* Event Info */}
                <div className="z-[700] text-xs flex justify-between pointer-events-none">
                    <div className="text-transparent">december 6, 2025</div>
                    <div className="bg-chocolate/12 rounded-full px-2 py-1">spill.purduehackers.com</div>
                </div>

                {/* Ticket */ }
                <div className="z-[615] absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                    <Ticket name={name} number={number} ticketDesign={ticketDesign} ticketColor={ticketColor} mousePos={mousePos} />
                </div>

                {/* Sticky Note Text Overlay */}
                <div className="z-5 w-64 h-64 absolute inset-0 top-[60%] left-[50%] drop-shadow-lg">
                    <img className="-hue-rotate-10 saturate-30 absolute top-0 left-0 w-full h-full object-contain select-none"
                        src="/img/sticky-notes.png"
                        alt="sticky note"
                        crossOrigin="anonymous" />
                    <div className="w-full h-full -rotate-15 flex items-center justify-center">
                        <div className="relative left-4 w-33 p-1 line-clamp-5 text-base text-coffee/80 font-nycd font-bold">
                            {message}
                        </div>
                    </div>
                </div>

                {/* Graph Paper */}
                <div className="z-1 absolute inset-0 top-0 left-5 pointer-events-none">
                    {/* Mostly blank paper */}
                    <img className="rotate-40 absolute top-1/2 -left-[60%] w-full h-full object-contain select-none"
                        src="/img/graphpaper.png"
                        alt="graph paper"
                        crossOrigin="anonymous" />
                    {/* Hackers logo paper */}
                    <img className="hidden rotate-205 absolute top-1/2 -left-1/2 w-full h-full object-contain select-none"
                        src="/img/graphpaper.png"
                        alt="graph paper"
                        crossOrigin="anonymous" />
                    {/* Frog paper */}
                    <img className="-rotate-15 absolute top-1/2 -left-[65%] w-full h-full object-contain select-none"
                        src="/img/graphpaper.png"
                        alt="graph paper"
                        crossOrigin="anonymous" />
                </div>

                {/* Tea Bag */}
                <div className="z-[612] absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Bag */}
                    <img
                        className="z-5 rotate-140 absolute top-32 left-0 w-32 max-w-[90vw] h-auto object-contain select-none drop-shadow-lg"
                        src="/img/tea-bag-bag.png"
                        alt="tea bag bag"
                        crossOrigin="anonymous"
                    />
                    {/* Tag */}
                    <img className={`absolute ${ticketOrientation === 'landscape' ? 'top-1/2 left-[28%] -rotate-10' : 'top-[40%] right-[6%] -rotate-140 origin-center'}
                                w-28 max-w-[50vw] h-auto object-contain select-none drop-shadow-lg`}
                        src="/img/tea-bag-tag-spill.png"
                        alt="tea bag tag"
                        crossOrigin="anonymous"
                    />
                </div>

                {/* Spills */}
                <div className="absolute inset-0 top-0 right-0 pointer-events-none">
                    <div className="z-2 absolute -top-18 sm:-top-18 left-0 sm:left-[55%] w-fit h-fit">
                        <img className="handle w-64 h-auto object-contain select-none"
                            src={`/img/coffee/85.png`}
                            alt="Spill"
                            crossOrigin="anonymous"/>
                    </div>
                    <div className="z-2 absolute top-24 -left-42 w-fit h-fit">
                        <img className="handle w-64 h-auto object-contain select-none"
                            src={`/img/coffee/89.png`}
                            alt="Spill"
                            crossOrigin="anonymous" />
                    </div>
                </div>
            </div>

            {/* Ticket */ }
            <div ref={mobileTicketContainerRef} 
                className="z-[615] absolute inset-0 w-124 h-124 aspect-square flex items-center justify-center pointer-events-none
                            overflow-hidden bg-paper border-2 border-sage/20 rounded-lg p-4">
                {/* Grain overlay for preview canvas */}
                <div
                    aria-hidden
                    className="z-1000 pointer-events-none absolute inset-0 mix-blend-overlay opacity-100"
                    style={{ backgroundImage: 'var(--grain-texture)', backgroundRepeat: 'repeat' }}
                />
                <Ticket name={name} number={number} ticketDesign={ticketDesign} ticketColor={ticketColor} mousePos={mousePos} />
            </div>
        </div>
    );
}
