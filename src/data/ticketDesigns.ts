export interface TicketDesign {
    id: string;
    name: string;
    color: string;
}

export const ticketDesigns = {
    landscape: {
        green: [
            {
                filename: 'matcha-latte.webp',
                name: 'matcha latte',
            },
            {
                filename: 'matcha.webp',
                name: 'sencha',
            },
            /*{
                filename: 'jasmine.webp',
                name: 'jasmine',
            },*/
            {
                filename: 'sencha.webp',
                name: 'jasmine',
            }
        ],
        brown: [
            {
                filename: 'latte.webp',
                name: 'caffè latte',
            },
            {
                filename: 'mocha.webp',
                name: 'mocha',
            },
            {
                filename: 'cappuccino.webp',
                name: 'cappuccino',
            }
        ]
    },
    portrait: {
        green: [
            {
                filename: 'matcha.webp',
                name: 'matcha',
            }
        ],
        brown: [
            {
                filename: 'espresso.webp',
                name: 'espresso',
            }
        ]
    }
};
