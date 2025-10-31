import { useState, useEffect } from 'react';

interface TicketProps {
    name: string;
    number: string;
    ticketDesign: string;
}

export default function Ticket({ name, number, ticketDesign }: TicketProps) {

    if (ticketDesign !== '4') {
        return (
            <div className="z-10 scale-115 rotate-15 translate-y-20 w-fit h-fit mx-auto">
                <img className="w-full md:w-124 h-fit object-contain drop-shadow-lg"
                    src={`/img/tickets/ticket${ticketDesign}.png`} 
                    alt="Ticket" />
                <div className="absolute top-0 -left-0 -rotate-90 ">
                    <div className="text-fern text-[10px] font-mono uppercase">
                        {name} // #{number.padStart(3, '0')}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="z-10 scale-95 rotate-0 md:translate-x-1/2 translate-y-2 w-fit h-fit"
            style={{
                '--ticket-height-large': '496px',
            } as React.CSSProperties}
        >
            <img className="w-fit h-[var(--ticket-height-large)] object-contain drop-shadow-lg"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" />
            <div className="absolute bottom-0 -left-0 w-full h-[calc(var(--ticket-height-large)_*_.19)] flex items-center justify-center">
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