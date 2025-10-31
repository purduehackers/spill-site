import { useState, useEffect } from 'react';

interface TicketProps {
    name: string;
    number: string;
    ticketDesign: string;
    mousePos: { x: number; y: number } | null;
}

export default function Ticket({ name, number, ticketDesign, mousePos }: TicketProps) {
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

    if (ticketDesign !== '4') {
        return (
            <div id="ticket-container" 
                className="z-10 scale-115 rotate-15 translate-y-20 w-fit h-fit mx-auto"
                style={{
                    '--ticket-width-large': '496px',
                    transform: `perspective(3000px) rotateX(${relativeMousePos.y * 0.06}deg) rotateY(${-relativeMousePos.x * 0.06}deg) rotateZ(${-relativeMousePos.x * 0.06}deg)`
                } as React.CSSProperties}
            >
                <img className="w-full md:w-[var(--ticket-width-large)] h-fit object-contain drop-shadow-lg"
                    src={`/img/tickets/ticket${ticketDesign}.png`} 
                    alt="Ticket" 
                    crossOrigin="anonymous"/>
                <div className="hidden absolute bottom-0 -left-0 w-full h-[calc(var(--ticket-height-large)_*_.19)] flex items-center justify-center">
                    <div className="w-[70%] h-[55%] text-fern uppercase flex flex-col justify-between">
                        <div className="text-[12px] font-mono flex justify-between">
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

    return (
        <div id="ticket-container"
            className="z-10 scale-95 rotate-0 md:translate-x-1/2 translate-y-2 w-fit h-fit"
            style={{
                '--ticket-height-large': '496px',
                transform: `perspective(3000px) rotateX(${relativeMousePos.y * 0.06}deg) rotateY(${-relativeMousePos.x * 0.06}deg) rotateZ(${-relativeMousePos.x * 0.06}deg)`
            } as React.CSSProperties}
        >
            <img className="w-fit h-[var(--ticket-height-large)] object-contain drop-shadow-lg"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" 
                crossOrigin="anonymous" />
            <div className="absolute bottom-0 left-0 w-full h-[calc(var(--ticket-height-large)_*_.19)] flex items-center justify-center">
                <div className="w-[70%] h-[55%] text-fern uppercase flex flex-col justify-between">
                    <div className="text-[12px] font-mono flex justify-between">
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