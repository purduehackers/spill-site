export interface TicketDesign {
    id: string;
    name: string;
    color: string;
}

export const ticketDesigns = {
    landscape: {
        green: [
            {
                filename: 'matcha-latte.png',
                name: 'matcha',
            },
            {
                filename: 'jasmine.png',
                name: 'jasmine',
            },
            {
                filename: 'sencha.png',
                name: 'sencha',
            }
        ],
        brown: [
            {
                filename: 'latte.png',
                name: 'caffè latte',
            },
            {
                filename: 'mocha.png',
                name: 'mocha',
            },
            {
                filename: 'cappuccino.png',
                name: 'cappuccino',
            }
        ]
    },
    portrait: {
        green: [
            {
                filename: 'matcha.png',
                name: 'matcha',
            }
        ],
        brown: [
            {
                filename: 'espresso.png',
                name: 'espresso',
            }
        ]
    }
};
