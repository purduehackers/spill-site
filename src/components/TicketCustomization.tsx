import { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

import ColorSelector from './ColorSelector';
import Draggable from './Draggable';
import Ticket from './Ticket';
import ToggleGroup from './ToggleGroup';
import Select from './Select';
import PaintCanvas from './PaintCanvas';
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

    const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

    useEffect(() => {
        // Detect touch-capable devices
        if (typeof window !== 'undefined') {
            const touchDetected =
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
    }, []);
    useEffect(() => {
        if (isTouchDevice) {
            // Ensure both orientation and ticket graphic update together on touch devices
            handleTicketOrientationChange('portrait');
        }
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
        const node = document.getElementById('ticket-customization-canvas');
        if (!node) return null;

        try {
            // Capture the original canvas
            const dataUrl = await htmlToImage.toPng(node);
            
            // Create a new canvas with Twitter's 2:1 aspect ratio (1200x600)
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            // Set canvas to Twitter's preferred dimensions
            canvas.width = 1200;
            canvas.height = 600;
            
            // Fill with paper color background
            ctx.fillStyle = '#f5f1e8';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate dimensions to fit the square image centered
            const scale = Math.min(canvas.height / img.height, canvas.height / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            
            // Draw the image centered
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create blob'));
                }, 'image/png');
            });
            
            const file = new File([blob], 'spill-ticket.png', { type: 'image/png' });

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload-ticket', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return { url: data.url, id: data.id };
        } catch (error) {
            console.error('Error uploading ticket:', error);
            return null;
        }
    }

    const downloadTicket = async () => {
        const node = document.getElementById('ticket-customization-canvas');
        if (!node) return;

        await uploadTicket();

        htmlToImage.toPng(node).then((dataUrl) => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${name.replace(/ /g, "-")}_spill-ticket.png`;
            link.click();
        });
    }

    const shareTicket = async () => {
        const node = document.getElementById('ticket-customization-canvas');
        if (!node) return;

        try {
            const result = await uploadTicket();

            const dataUrl = await htmlToImage.toPng(node);
            const blob = await (await fetch(dataUrl)).blob();
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
        }
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
                '--preview-size-large': '500px',
            } as React.CSSProperties}
        >
            {/* Options Panel */}
            <div className="w-full md:w-[40%] h-fit md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] flex flex-col justify-between gap-4 bg-coffee text-paper border-2 border-coffee rounded-lg p-4">
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
                                        <svg
                                            fill="currentColor"
                                            width="18"
                                            height="18"
                                            viewBox="0 -4.23 100 100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="inline-block"
                                        >
                                            <path
                                                id="_pencil"
                                                data-name="pencil"
                                                d="M407.273,1184.529a5.432,5.432,0,0,1-1.048.087,2.453,2.453,0,0,1-2.178-2.916,11.252,11.252,0,0,1,1.581-4.045c.476-.735,1.029-1.422,1.456-2.182a14.738,14.738,0,0,0,1.526-3.125,140.226,140.226,0,0,1,5.682-15.592c.661-1.617,1.37-3.22,1.935-4.873a8,8,0,0,1,2.437-3.553c3.462-2.984,6.873-6.029,10.361-8.978a205.247,205.247,0,0,0,20.018-19.558c1.366-1.52,2.691-3.073,4.045-4.6a42.667,42.667,0,0,1,6.053-5.469,68.569,68.569,0,0,0,6.9-5.834,15.923,15.923,0,0,1,1.537-1.342,30.908,30.908,0,0,0,6.665-6.894c2.23-3.242,2.776-2.545,5.65-2.409a5.114,5.114,0,0,1,1.681.417c2.33.972,4.659,1.955,6.955,3a16.738,16.738,0,0,1,3.871,2.579,8.68,8.68,0,0,1,2.477,3.2,39.628,39.628,0,0,0,3.762,6.225c1.01,1.545,1.994,3.109,2.92,4.7a6.408,6.408,0,0,1,.853,2.152,9.157,9.157,0,0,0,1.275,3.8,2.4,2.4,0,0,1-.3,2.752,22.411,22.411,0,0,1-2.462,2.862c-1.93,1.779-3.959,3.451-5.938,5.177-3.885,3.384-7.8,6.737-11.635,10.18-3.473,3.122-6.814,6.382-10.287,9.5-2.821,2.531-5.7,5-8.647,7.392-4.684,3.8-9.394,7.552-13.836,11.637-1.575,1.448-3.216,2.825-4.85,4.206a10.927,10.927,0,0,1-1.671,1.16c-1.273.709-2.557,1.4-3.871,2.029a7.973,7.973,0,0,1-2.463.858c-6.022.615-11.748,2.552-17.631,3.791a28.533,28.533,0,0,0-7.127,2.314A10.972,10.972,0,0,1,407.273,1184.529Zm73.82-82.609a1.143,1.143,0,0,0-.136-.21c-.03-.036-.094-.04-.142-.061.118.064.235.127.354.189-.212.862.417,1.415.784,2.053a.718.718,0,0,0,.978.3,1.86,1.86,0,0,0,.857-.681c.223-.462-.306-.606-.6-.744C482.512,1102.446,481.8,1102.2,481.093,1101.92Zm-48.467,55.431c.046.829.049,1.218.091,1.6a1.338,1.338,0,0,0,1.339,1.268c.289.024.582.006.873.03a2.83,2.83,0,0,0,2.712-1.325,32.779,32.779,0,0,1,3.023-3.531,109.438,109.438,0,0,1,12.592-10.807q11.037-8.344,22.017-16.765,2.085-1.594,4.086-3.287c1.708-1.435,3.341-2.963,5.075-4.369s3.575-2.682,5.322-4.071c3.341-2.653,3-2.534.427-5.582a1.3,1.3,0,0,0-1.827-.312,37.343,37.343,0,0,0-6.581,4.283,43.025,43.025,0,0,1-7.322,4.742,31.749,31.749,0,0,0-7.539,5.434c-6.239,5.986-12.485,11.959-18.945,17.713-4.642,4.131-9,8.585-13.911,12.413A3.037,3.037,0,0,0,432.626,1157.351Zm11.575,9.968a2.37,2.37,0,0,0,.74-.334c.986-.938,1.957-1.891,2.9-2.869a81.022,81.022,0,0,1,8.934-7.9,180.092,180.092,0,0,0,15.875-13.7c5.923-5.759,12.089-11.239,18.4-16.566,2.075-1.753,4.063-3.61,6.073-5.441a4.409,4.409,0,0,0,.892-1.128.968.968,0,0,0-.061-.8,1.171,1.171,0,0,0-1.934-.388c-2.956,2.368-5.924,4.722-8.844,7.13-1.947,1.6-3.756,3.381-5.746,4.924-5.982,4.646-12.027,9.211-18.038,13.813-5.01,3.835-10.034,7.656-15,11.542-1.987,1.553-3.842,3.276-5.766,4.908a1.671,1.671,0,0,0-.465,2.084c.433,1.182.752,2.4,1.137,3.6a2.982,2.982,0,0,0,.395.777A1.943,1.943,0,0,0,444.2,1167.319Zm-4.145,3.1c-.04-.09-.081-.176-.117-.267a27.87,27.87,0,0,1-1.311-3.538,2.694,2.694,0,0,0-2.646-2.26c-1.061-.107-2.134-.1-3.2-.178-2.756-.207-4.13-.246-4.174-4.2a3.493,3.493,0,0,0-1.937-3.314q-2.938-1.6-5.919-3.131a1.083,1.083,0,0,0-1.49.47,4.753,4.753,0,0,0-.536,1.337,76.733,76.733,0,0,1-2.637,10.426,3.148,3.148,0,0,0,.59,3.25,18.417,18.417,0,0,0,2.736,2.6,5.434,5.434,0,0,1,2.21,2.957c.211.774.613.924,1.3.728,1.958-.546,3.9-1.161,5.877-1.644,2.544-.619,5.118-1.1,7.662-1.709,1.121-.27,2.207-.69,3.3-1.072C439.9,1170.828,439.961,1170.575,440.056,1170.417Zm-3.133-30.053a1.774,1.774,0,0,0-2.253.6c-.682.688-1.383,1.361-2.016,2.091a1.4,1.4,0,0,0,.463,2.2,1.148,1.148,0,0,0,1.362.021c1.5-1.058,3.029-2.083,4.444-3.25,2.313-1.911,4.553-3.915,6.8-5.9a18.276,18.276,0,0,0,1.346-1.459c-.417-.967-1.369-.389-2.016-.69-.172-.081-.4-.055-.557-.149a1.873,1.873,0,0,0-2.569.5c-.457.5-.953.967-1.441,1.435a1.8,1.8,0,0,0-.589,2.305,1.3,1.3,0,0,1-.933,1.809C438.247,1140.115,437.485,1140.233,436.923,1140.364Zm32.983-33.158a2.089,2.089,0,0,0-.51.218c-.3.245-.567.516-.838.788-1.136,1.121-1.111,1.261.2,2.023a8.72,8.72,0,0,1,3.009,2.143c.476.654.751.591,1.248-.178,1.184-1.829,1.858-1.565-.555-3.223-.707-.486-1.347-1.067-2.034-1.586A1.791,1.791,0,0,0,469.906,1107.206Zm-6.029,6.285c-1.2-.223-1.352-.184-1.771.318-.74.885-1.465,1.778-2.191,2.674a.729.729,0,0,0-.083.242c.174.045.448.188.506.125a3.17,3.17,0,0,1,3.2-.814,5.359,5.359,0,0,1,2.063.952.988.988,0,0,0,1.48-.083c.072-.061.151-.119.226-.178,1.164-.892,1.119-1.227-.184-2.033A8.361,8.361,0,0,0,463.877,1113.491Zm11.3-10.916c-.309.244-.7.515-1.048.825-.372.327-.395.7-.043.944q1.917,1.3,3.86,2.557c.616.4,1.1.023,1.552-.358a.611.611,0,0,0,.066-.978c-1.24-.914-2.481-1.832-3.728-2.737A3.22,3.22,0,0,0,475.18,1102.575Zm-14.326,20.217c-.023-.166-.007-.263-.049-.318-.053-.071-.16-.172-.225-.161a4.681,4.681,0,0,1-4.7-1.461.3.3,0,0,0-.25-.031.874.874,0,0,0-.245.15.838.838,0,0,0-.257,1.231,6.211,6.211,0,0,1,2.077,3.054c.074.355.4.315.645.137.311-.224.607-.474.9-.728C459.466,1124.032,460.178,1123.391,460.854,1122.792Zm-8.3,7.066a1.486,1.486,0,0,0,.515-.188c.506-.435.993-.894,1.471-1.361.339-.33.28-.649-.075-.939-.591-.485-1.165-.991-1.77-1.457a3.194,3.194,0,0,0-.766-.375c-.324-.137-1.028.287-1.328.878a.787.787,0,0,0,.081.723,5.674,5.674,0,0,1,1.447,2.426C452.169,1129.694,452.412,1129.762,452.558,1129.858Zm-2.773,1.988c-.028.048-.1.117-.081.153.03.069.106.118.161.176.035-.109.068-.219.1-.329Z"
                                                transform="translate(-404 -1093.086)"
                                                fillRule="evenodd"
                                            ></path>
                                        </svg>
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
                        <button
                            onClick={async () => {
                                const result = await uploadTicket();
                                const tweetText = result
                                    ? `Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!\n\nhttps://spill.purduehackers.com/tickets/${result.id}`
                                    : 'Come join me at spill ≋, a creative-technical showcase produced by @purduehackers, on December 6th, 2025!';
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-paper text-coffee px-4 py-2 rounded-lg border-2 border-coffee hover:bg-sage transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            tweet
                        </button>

                        <button
                            onClick={downloadTicket}
                            className="flex-1 flex items-center justify-center gap-2 bg-paper text-coffee px-4 py-2 rounded-lg border-2 border-coffee hover:bg-sage transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                            download
                        </button>
                    </div>

                    <button
                        onClick={shareTicket}
                        className="w-full flex items-center justify-center gap-2 bg-matcha text-paper px-4 py-2 rounded-lg hover:bg-sage transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                        </svg>
                        share
                    </button>
                </div>
            </div>

            {/* Ticket Customization Preview Canvas */}
            <div id="ticket-customization-canvas"
				ref={canvasContainerRef}
				className={`z-500 relative w-full md:w-[var(--preview-size-medium)] lg:w-[calc(var(--preview-size-large)_+_120px)] h-140 sm:h-140 md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)]
                    overflow-hidden select-none flex flex-col gap-4 justify-between bg-${'paper'} border-2 border-sage/20 rounded-lg p-4`}
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
                <img className="hidden z-5 rotate-50 absolute top-0 -left-25 w-80 h-full object-contain select-none drop-shadow-lg"
                    src="/img/tea-bag-green.png"
                    alt="blank paper"
                    crossOrigin="anonymous" />
                <img className="hidden z-5 rotate-200 absolute top-0 -left-48 w-120 h-full object-contain select-none drop-shadow-lg"
                    src="/img/tea-bag.png"
                    alt="blank paper"
                    crossOrigin="anonymous" />

                {/* Coffee Cup */}
                <img src="/img/coffee-cup-1.jpg"
                    alt="Ticket"
                    className="hidden scale-215 absolute top-30 -left-20 w-200 h-full object-cover"
                    crossOrigin="anonymous" />

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

                {/* Regular Tea Tags */}
                <div className="hidden flex flex-col gap-2 p-6 text-xs"
                    style={{
                        '--tea-tag-size': '40px',
                    } as React.CSSProperties}
                >
                    <div className="flex flex-row gap-2">
                        <Draggable className="relative top-0 left-0 w-fit h-fit">
                            <div className="handle tea-tag w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] shadow-lg">
                                <div className="w-full h-full flex flex-col items-center justify-center">

                                </div>
                            </div>
                        </Draggable>
                        <div className="tea-tag w-[var(--tea-tag-size)] h-[var(--tea-tag-size)] bg-sage shadow-lg">
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
