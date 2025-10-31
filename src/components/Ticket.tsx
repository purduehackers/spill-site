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
        <div className="z-10 scale-95 rotate-0 md:translate-x-1/2 translate-y-2 w-fit h-fit">
            <img className="w-fit h-124 object-contain drop-shadow-lg"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" />
            <div className="">
                {name} // #{number.padStart(3, '0')}
            </div>
        </div>
    );
}