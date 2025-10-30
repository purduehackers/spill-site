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
        <div className="z-10 w-full h-full max-w-full max-h-full mx-auto">
            <img className="w-fit h-fit max-w-full max-h-full object-fit"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" />
            <div className="">
                {name}
                <br />
                #{number.padStart(3, '0')}
            </div>
        </div>
    );
}