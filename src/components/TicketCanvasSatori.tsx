// Pure JSX component for Satori - represents the ticket canvas structure
// No hooks, no state, no refs - just pure JSX with inline styles

interface TicketCanvasSatoriProps {
    name: string;
    number: string;
    message: string;
    ticketDesign: string; // base64 data URL
    ticketOrientation: 'portrait' | 'landscape';
    ticketColor: 'green' | 'brown';
    stickyNoteImage: string; // base64 data URL
    graphPaperImage: string; // base64 data URL
    teaBagBagImage: string; // base64 data URL
    teaBagTagImage: string; // base64 data URL
    spill1Image: string; // base64 data URL
    spill2Image: string; // base64 data URL
    drawingImage?: string; // base64 data URL of canvas drawing (optional)
}

export function TicketCanvasSatori({
    name,
    number,
    message,
    ticketDesign,
    ticketOrientation,
    ticketColor,
    stickyNoteImage,
    graphPaperImage,
    teaBagBagImage,
    teaBagTagImage,
    spill1Image,
    spill2Image,
    drawingImage,
}: TicketCanvasSatoriProps) {
    const isPortrait = ticketOrientation === 'portrait';
    const textColor = ticketColor === 'green' ? '#b0b69a' : '#d0c1b6'; // fern or light-brown

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: '#e0dbd3',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                overflow: 'hidden',
            }}
        >
            {/* Graph Paper Background */}
            <img
                src={graphPaperImage}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-60%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'rotate(40deg)',
                    opacity: 0.3,
                }}
            />
            <img
                src={graphPaperImage}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '-65%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'rotate(-15deg)',
                    opacity: 0.3,
                }}
            />

            {/* Spills */}
            <img
                src={spill1Image}
                style={{
                    position: 'absolute',
                    top: '-72px',
                    left: '55%',
                    width: '256px',
                    height: 'auto',
                    objectFit: 'contain',
                }}
            />
            <img
                src={spill2Image}
                style={{
                    position: 'absolute',
                    top: '96px',
                    left: '-168px',
                    width: '256px',
                    height: 'auto',
                    objectFit: 'contain',
                }}
            />

            {/* Tea Bag */}
            <img
                src={teaBagBagImage}
                style={{
                    position: 'absolute',
                    top: '128px',
                    left: 0,
                    width: '128px',
                    height: 'auto',
                    objectFit: 'contain',
                    transform: 'rotate(140deg)',
                }}
            />
            <img
                src={teaBagTagImage}
                style={{
                    position: 'absolute',
                    ...(isPortrait
                        ? { top: '40%', right: '6%', transform: 'rotate(-140deg)' }
                        : { top: '50%', left: '28%', transform: 'rotate(-10deg)' }),
                    width: '112px',
                    height: 'auto',
                    objectFit: 'contain',
                }}
            />

            {/* Drawing Canvas Overlay (if exists) */}
            {drawingImage && (
                <img
                    src={drawingImage}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                />
            )}

            {/* Ticket */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        ...(isPortrait
                            ? {
                                  width: '230px',
                                  height: '496px',
                                  transform: 'scale(0.95) rotate(20deg) translateY(12px)',
                              }
                            : {
                                  width: '496px',
                                  height: '200px',
                                  transform: 'scale(1.15) rotate(20deg) translateY(-80px)',
                              }),
                    }}
                >
                    <img
                        src={ticketDesign}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />

                    {/* Ticket Text Overlay */}
                    {isPortrait ? (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                width: '100%',
                                height: '20%',
                                minHeight: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '70%',
                                    maxWidth: '161px',
                                    height: '55%',
                                    color: textColor,
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    fontFamily: 'OCR B Pro, monospace',
                                }}
                            >
                                <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                                    <div>{name.concat(' ').padEnd(12, '*')}</div>
                                    <div>// {number.padStart(3, '0')}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0 }}>
                                    <div style={{ transform: 'scaleY(1.2)', height: '66%', fontFamily: 'Libre Barcode 128, sans-serif', fontSize: '48px', lineHeight: 1 }}>
                                        purdueha
                                    </div>
                                    <div style={{ transform: 'rotate(-90deg) translateX(8px)', fontFamily: 'CMU Serif, serif', fontSize: '26px' }}>
                                        PH
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                position: 'absolute',
                                left: '-32px',
                                top: '50%',
                                transform: 'translateY(-50%) rotate(90deg)',
                                width: '31%',
                                height: '60%',
                                maxHeight: '161px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: '84%',
                                    height: 'auto',
                                    color: textColor,
                                    textTransform: 'uppercase',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    fontFamily: 'OCR B Pro, monospace',
                                }}
                            >
                                <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'space-between', transform: 'rotate(180deg)' }}>
                                    <div>{name.concat(' ').padEnd(12, '*')}</div>
                                    <div>// {number.padStart(3, '0')}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0 }}>
                                    <div style={{ transform: 'scaleY(1.2)', fontFamily: 'Libre Barcode 128, sans-serif', fontSize: '36px', lineHeight: 1 }}>
                                        purdueha
                                    </div>
                                    <div style={{ transform: 'rotate(-90deg) translateX(8px) translateY(-8px)', fontFamily: 'CMU Serif, serif', fontSize: '24px' }}>
                                        PH
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Note */}
            <div
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '50%',
                    width: '256px',
                    height: '256px',
                    display: 'flex',
                }}
            >
                <img
                    src={stickyNoteImage}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'hue-rotate(-10deg) saturate(30%)',
                    }}
                />
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        transform: 'rotate(-15deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            left: '16px',
                            width: '132px',
                            padding: '4px',
                            fontFamily: 'Nothing You Could Do, cursive',
                            fontSize: '16px',
                            color: 'rgba(75, 55, 50, 0.8)',
                            fontWeight: 'bold',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {message}
                    </div>
                </div>
            </div>

            {/* Event Info */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    padding: '8px',
                }}
            >
                <div style={{ color: 'transparent' }}>december 6, 2025</div>
                <div
                    style={{
                        backgroundColor: 'rgba(116, 71, 38, 0.12)',
                        borderRadius: '9999px',
                        padding: '4px 8px',
                    }}
                >
                    spill.purduehackers.com
                </div>
            </div>
        </div>
    );
}

