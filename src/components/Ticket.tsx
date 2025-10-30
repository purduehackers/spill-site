import { useState, useEffect } from 'react';

export default function Ticket({ ticketDesign }: { ticketDesign: string }) {
    return (
        <div className="z-10 w-full h-full max-w-full max-h-full mx-auto">
            <img className="w-fit h-fit max-w-full max-h-full object-fit"
                src={`/img/tickets/ticket${ticketDesign}.png`} 
                alt="Ticket" />
        </div>
    );
}