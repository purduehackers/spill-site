import type { APIRoute } from 'astro';
import satori from 'satori';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Load fonts once (can be cached)
async function loadFonts() {
    const [authenticSans, authenticSansBold, ocrBPro, cmuSerif] = await Promise.all([
        readFile(join(process.cwd(), 'public', 'fonts', 'authentic-sans-90.otf')),
        readFile(join(process.cwd(), 'public', 'fonts', 'authentic-sans-130.otf')),
        readFile(join(process.cwd(), 'public', 'fonts', 'OCRBPro.TTF')),
        readFile(join(process.cwd(), 'public', 'fonts', 'cmunrm.ttf')),
    ]);

    // Google Fonts: (Caveat, Nothing You Could Do, Libre Barcode 128)
    return [
        {
            name: 'Authentic Sans',
            data: authenticSans,
            weight: 300 as const,
            style: 'normal' as const,
        },
        {
            name: 'Authentic Sans',
            data: authenticSansBold,
            weight: 500 as const,
            style: 'normal' as const,
        },
        {
            name: 'OCR B Pro',
            data: ocrBPro,
            weight: 400 as const,
            style: 'normal' as const,
        },
        {
            name: 'CMU Serif',
            data: cmuSerif,
            weight: 400 as const,
            style: 'normal' as const,
        },
        // Use Authentic Sans as fallback
        {
            name: 'Nothing You Could Do',
            data: authenticSans,
            weight: 400 as const,
            style: 'normal' as const,
        },
        {
            name: 'Libre Barcode 128',
            data: authenticSans,
            weight: 400 as const,
            style: 'normal' as const,
        },
    ];
}

// Cache fonts
let fontsCache: Awaited<ReturnType<typeof loadFonts>> | null = null;

async function getFonts() {
    if (!fontsCache) {
        fontsCache = await loadFonts();
    }
    return fontsCache;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const {
            name,
            number,
            message,
            ticketDesign, // base64 data URL
            ticketOrientation,
            ticketColor,
            stickyNoteImage, // base64 data URL
            graphPaperImage, // base64 data URL
            teaBagBagImage, // base64 data URL
            teaBagTagImage, // base64 data URL
            spill1Image, // base64 data URL
            spill2Image, // base64 data URL
            drawingImage, // base64 data URL (optional)
            width = 600,
            height = 600,
        } = body;

        if (!name || !number || !ticketDesign) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const fonts = await getFonts();

        // Import the TicketCanvasSatori component dynamically
        const { TicketCanvasSatori } = await import('../../components/TicketCanvasSatori');

        const svg = await satori(
            TicketCanvasSatori({
                name,
                number,
                message: message || '',
                ticketDesign,
                ticketOrientation: ticketOrientation || 'landscape',
                ticketColor: ticketColor || 'green',
                stickyNoteImage: stickyNoteImage || '',
                graphPaperImage: graphPaperImage || '',
                teaBagBagImage: teaBagBagImage || '',
                teaBagTagImage: teaBagTagImage || '',
                spill1Image: spill1Image || '',
                spill2Image: spill2Image || '',
                drawingImage,
            }),
            {
                width,
                height,
                fonts,
            }
        );

        return new Response(svg, {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml' },
        });
    } catch (error) {
        console.error('Satori generation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate ticket' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

