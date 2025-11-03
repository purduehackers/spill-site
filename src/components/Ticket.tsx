import { useState, useEffect } from 'react';

interface TicketProps {
    name: string;
    number: string;
    ticketDesign: string; // file path to ticket image
    ticketColor: string;
    mousePos: { x: number; y: number } | null;
}

export default function Ticket({ name, number, ticketDesign, ticketColor, mousePos }: TicketProps) {
    const [relativeMousePos, setRelativeMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    useEffect(() => {
        // If mouse is not over the canvas, reset to default centered rotation
        if (!mousePos) {
            setRelativeMousePos({ x: 0, y: 0 });
            return;
        }
        // Calculate mouse position relative to ticket center on viewport
        const rect = document.getElementById('ticket-container')?.getBoundingClientRect();
        const mouseX = mousePos.x - (rect?.left || 0) - (rect?.width || 0) / 2;
        const mouseY = mousePos.y - (rect?.top || 0) - (rect?.height || 0) / 2;
        setRelativeMousePos({ x: mouseX, y: mouseY });
    }, [mousePos]);

    // Determine if this is a portrait ticket (for different styling)
    const isPortrait = ticketDesign.includes('/portrait/');
    
    if (!isPortrait) {
        return (
            <div id="ticket-container" 
                className="relative z-10 scale-115 rotate-20 -translate-y-20 w-fit h-fit mx-auto"
                style={{
                    '--ticket-width-large': '496px',
                    '--ticket-height-large': '200px',
                    transform: `perspective(3000px) rotateX(${relativeMousePos.y * 0.06}deg) rotateY(${-relativeMousePos.x * 0.06}deg) rotateZ(${-relativeMousePos.x * 0.02}deg)`
                } as React.CSSProperties}
            >
                <img className="w-full md:w-[var(--ticket-width-large)] h-fit object-contain drop-shadow-lg text-fern text-light-brown"
                    src={ticketDesign} 
                    alt="Ticket" 
                    crossOrigin="anonymous"/>
                
                {/* Side text */}
                <div className="w-[31%] h-[40%] md:h-[60%] max-h-[161px] absolute -left-8 sm:-left-9 top-1/2 -translate-y-1/2 rotate-90 origin-center flex items-center justify-center pointer-events-none">
                    <div className={`w-[84%] h-fit text-${ticketColor === 'green' ? 'fern' : 'light-brown'} uppercase flex flex-col gap-4`}>
                        {/* Name and number */}
                        <div className="text-[7px] sm:text-[9px] font-mono flex justify-between origin-center rotate-180">
                            <div>
                                {name.concat(' ').padEnd(12, '*')}
                            </div>
                            <div>
                                // {number.padStart(3, '0')}
                            </div>
                        </div>
                        {/* Barcode */}
                        <div className="flex items-center justify-between gap-0">
                            <div className="scale-y-120 font-barcode text-4xl leading-none">
                                purdueha
                            </div>
                            <div className="-rotate-90 translate-x-2 font-serif text-[20px]">
                                PH
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="ticket-container"
            className="relative z-10 scale-95 rotate-20 translate-y-3 w-[var(--ticket-width-large)] h-fit"
            style={{
                '--ticket-width-large': '230px',
                '--ticket-height-large': '496px',
                transform: `perspective(3000px) rotateX(${relativeMousePos.y * 0.06}deg) rotateY(${-relativeMousePos.x * 0.06}deg) rotateZ(${-relativeMousePos.x * 0.02}deg)`
            } as React.CSSProperties}
        >
            <img className="w-full h-auto object-contain drop-shadow-lg block text-fern text-light-brown"
                src={ticketDesign} 
                alt="Ticket" 
                crossOrigin="anonymous" />
            
            {/* Bottom text */}
            <div className="absolute bottom-0 left-0 right-0 w-full h-[20%] min-h-[80px] flex items-center justify-center pointer-events-none">
                <div className={`w-[70%] max-w-[161px] h-[55%] text-${ticketColor === 'green' ? 'fern' : 'light-brown'} uppercase flex flex-col justify-between`}>
                    <div className="text-[12px] font-mono flex justify-between whitespace-nowrap">
                        <div>
                            {name.concat(' ').padEnd(12, '*')}
                        </div>
                        <div>
                            // {number.padStart(3, '0')}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-0">
                        <div className="scale-y-120 h-2/3 font-barcode text-5xl leading-none">
                            purdueha
                        </div>
                        <div className="-rotate-90 translate-x-2 font-serif text-[26px]">
                            PH
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}