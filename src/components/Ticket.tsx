import { useState, useEffect } from 'react';

interface TicketProps {
    name: string;
    ticketDesign: string;
}

export default function Ticket({ name, ticketDesign }: TicketProps) {
    const [number, setNumber] = useState<string>('');

    useEffect(() => {
        setNumber(localStorage.getItem('ticket-number') || '');
    }, []);

    return (
        <div className="z-10 scale-115 rotate-15 translate-y-4 w-fit h-fit mx-auto">
            <img className="w-124 h-fit object-fit"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" />
            <div className="">
                {name} // #{number.padStart(3, '0')}
            </div>
        </div>
    );
}