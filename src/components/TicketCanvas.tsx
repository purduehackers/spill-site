import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Group, Image as KonvaImage, 
    Text as KonvaText, Line as KonvaLine, Rect } from 'react-konva';

type MousePosition = { x: number; y: number } | null;

interface TicketCanvasProps {
    name: string;
    number: string;
    message: string;
    ticketDesign: string; // "1" | "2" | "3" | "4"
    backgroundColor: string; // tailwind token used in existing class e.g. "paper", "moss"
    className?: string; // allow caller to pass sizing classes; default matches preview canvas
    drawingEnabled?: boolean; // optional freehand
}

// Simple image loader hook compatible with react-konva
function useHtmlImage(src: string | null): HTMLImageElement | null {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!src) {
            setImage(null);
            return;
        }
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        const handleLoad = () => setImage(img);
        img.addEventListener('load', handleLoad);
        return () => {
            img.removeEventListener('load', handleLoad);
        };
    }, [src]);

    return image;
}

export default function TicketCanvas({
    name,
    number,
    message,
    ticketDesign,
    backgroundColor,
    className,
    drawingEnabled = false,
}: TicketCanvasProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<any>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 500, height: 500 });
    const [mousePos, setMousePos] = useState<MousePosition>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState<Array<{ points: number[] }>>([]);

    // Compute responsive size from wrapper
    useEffect(() => {
        if (!wrapperRef.current) return;
        const node = wrapperRef.current;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cr = entry.contentRect;
                setSize({ width: cr.width, height: cr.height });
            }
        });
        ro.observe(node);
        // initial size
        const rect = node.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
        return () => ro.disconnect();
    }, []);

    // Assets
    const ticketSrc = useMemo(() => `/img/tickets/ticket${ticketDesign}.png`, [ticketDesign]);
    const stickySrc = '/img/untidy-stack-yellow-sticky-post-notes-isolated-white.png';
    const spill85Src = '/img/coffee/85.png';
    const spill89Src = '/img/coffee/89.png';

    const ticketImg = useHtmlImage(ticketSrc);
    const stickyImg = useHtmlImage(stickySrc);
    const spill85Img = useHtmlImage(spill85Src);
    const spill89Img = useHtmlImage(spill89Src);

    // Parallax-esque tilt for ticket based on mouse position
    const ticketTransform = useMemo(() => {
        if (!mousePos) return { rotation: 0, offsetX: 0, offsetY: 0 };
        const relX = (mousePos.x - size.width / 2);
        const relY = (mousePos.y - size.height / 2);
        const rot = (-relX) * 0.06; // approximate existing effect
        return { rotation: rot, offsetX: 0, offsetY: 0 };
    }, [mousePos, size.width, size.height]);

    // Freehand drawing
    const handleStageMouseDown = useCallback((e: any) => {
        if (!drawingEnabled) return;
        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();
        if (!pos) return;
        setLines((prev) => [...prev, { points: [pos.x, pos.y] }]);
    }, [drawingEnabled]);

    const handleStageMouseMove = useCallback((e: any) => {
        if (drawingEnabled) {
            if (!isDrawing) return;
            const stage = e.target.getStage();
            const point = stage.getPointerPosition();
            if (!point) return;
            setLines((prev) => {
                const newLines = prev.slice();
                const last = newLines[newLines.length - 1];
                last.points = last.points.concat([point.x, point.y]);
                return newLines;
            });
        }
        // track mouse for ticket tilt
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        if (point) setMousePos(point);
    }, [drawingEnabled, isDrawing]);

    const handleStageMouseUp = useCallback(() => {
        if (drawingEnabled) setIsDrawing(false);
    }, [drawingEnabled]);

    // Export function (download button included below)
    const exportPng = useCallback((filename: string = 'ticket.png') => {
        if (!stageRef.current) return;
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // Layout constants mapped from existing DOM/CSS
    const padding = 16; // approx p-4
    const headerHeight = 20; // small header bar text area

    // Positions approximated from existing absolute utility classes
    const ticketScale = ticketDesign === '4' ? 0.95 : 1.15;
    const ticketRotationBase = ticketDesign === '4' ? 0 : 15;

    // Ticket size reference (will auto-scale by image natural size and ticketScale)
    const ticketHeightTarget = Math.min(size.height * 0.75, 496); // mirrors --ticket-height-large

    // Sticky note placement similar to top-[40%] left-[60%]
    const stickyW = 256;
    const stickyH = 256;
    const stickyX = size.width * 0.60 - stickyW / 2;
    const stickyY = size.height * 0.40 - stickyH / 2;

    // Spills positions roughly matching CSS absolute offsets
    const spill85X = size.width * 0.58 - 128;
    const spill85Y = -96;
    const spill89X = size.width * 0.15 - 128;
    const spill89Y = -96;

    return (
        <div
            ref={wrapperRef}
            className={
                className ||
                `z-500 relative w-full md:w-[var(--preview-size-medium)] lg:w-[var(--preview-size-large)] h-140 sm:h-140 md:h-[var(--preview-size-medium)] lg:h-[var(--preview-size-large)] overflow-hidden select-none flex flex-col gap-4 justify-between bg-${backgroundColor} border-2 border-sage/20 rounded-lg p-4`
            }
            onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => setMousePos(null)}
        >
            {/* Grain overlay (DOM) to mimic mix-blend-overlay */}
            <div
                aria-hidden
                className="z-1000 pointer-events-none absolute inset-0 mix-blend-overlay opacity-100"
                style={{ backgroundImage: 'var(--grain-texture)', backgroundRepeat: 'repeat' }}
            />

            {/* Konva Stage */}
            <Stage
                ref={stageRef}
                width={size.width}
                height={size.height}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                style={{ position: 'absolute', inset: 0 }}
            >
                {/* Background rect to ensure export background */}
                <Layer listening={false}>
                    <Rect x={0} y={0} width={size.width} height={size.height} fill={getComputedStyleColor(backgroundColor)} />
                </Layer>

                {/* Event info header */}
                <Layer>
                    <KonvaText
                        x={padding}
                        y={padding}
                        text={'december 6, 2025'}
                        fontSize={12}
                        fontStyle="bold"
                        fill={'#00000000'}
                    />
                    <KonvaText
                        x={size.width - padding}
                        y={padding}
                        text={'spill.purduehackers.com'}
                        fontSize={12}
                        align="right"
                        width={200}
                        offsetX={200}
                        fill={'#2b2b2b'}
                    />
                </Layer>

                {/* Ticket image with tilt */}
                <Layer>
                    <Group
                        x={size.width / 2}
                        y={size.height / 2}
                        rotation={ticketRotationBase + ticketTransform.rotation}
                    >
                        {ticketImg && (
                            <KonvaImage
                                image={ticketImg}
                                width={(ticketImg.naturalWidth / ticketImg.naturalHeight) * ticketHeightTarget * ticketScale}
                                height={ticketHeightTarget * ticketScale}
                                offsetX={((ticketImg.naturalWidth / ticketImg.naturalHeight) * ticketHeightTarget * ticketScale) / 2}
                                offsetY={(ticketHeightTarget * ticketScale) / 2}
                                shadowColor={'rgba(0,0,0,0.35)'}
                                shadowBlur={20}
                                shadowOffset={{ x: 0, y: 6 }}
                                shadowOpacity={1}
                            />
                        )}

                        {/* For ticket design 4, overlay name and barcode-like text at bottom area */}
                        {ticketDesign === '4' && (
                            <Group
                                y={(ticketHeightTarget * ticketScale) / 2 - (ticketHeightTarget * 0.19) + 6}
                                offsetX={0}
                            >
                                <KonvaText
                                    x={-((ticketImg?.naturalWidth || 496) / (ticketImg?.naturalHeight || 496) * ticketHeightTarget * ticketScale) * 0.35}
                                    y={0}
                                    text={name.concat(' ').padEnd(12, '*')}
                                    fontSize={12}
                                    fontFamily={'monospace'}
                                    fill={'#1e7a57'}
                                    width={((ticketImg?.naturalWidth || 496) / (ticketImg?.naturalHeight || 496) * ticketHeightTarget * ticketScale) * 0.7}
                                    align={'left'}
                                    listening={false}
                                />
                                {/* Simulated barcode + PH */}
                                <KonvaText
                                    x={((ticketImg?.naturalWidth || 496) / (ticketImg?.naturalHeight || 496) * ticketHeightTarget * ticketScale) * 0.1}
                                    y={14}
                                    text={'purdueha'}
                                    fontSize={36}
                                    fontFamily={'monospace'}
                                    scaleY={1.2}
                                    fill={'#1e7a57'}
                                    listening={false}
                                />
                            </Group>
                        )}
                    </Group>
                </Layer>

                {/* Sticky note with message (draggable) */}
                <Layer>
                    <Group draggable x={stickyX} y={stickyY}>
                        {stickyImg && (
                            <KonvaImage
                                image={stickyImg}
                                width={stickyW}
                                height={stickyH}
                                filters={[]}
                            />
                        )}
                        <Group x={0} y={0} rotation={-15} width={stickyW} height={stickyH}>
                            <KonvaText
                                x={16}
                                y={stickyH / 2 - 32}
                                width={132}
                                text={message}
                                fontSize={16}
                                fontStyle={'bold'}
                                fontFamily={'nycd, sans-serif'}
                                fill={'#6b4c3b'}
                                listening={false}
                            />
                        </Group>
                    </Group>
                </Layer>

                {/* Spills (draggable) */}
                <Layer>
                    <Group draggable x={spill85X} y={spill85Y}>
                        {spill85Img && (
                            <KonvaImage image={spill85Img} width={256} height={(256 * (spill85Img.naturalHeight || 256)) / (spill85Img.naturalWidth || 256)} />
                        )}
                    </Group>
                    <Group draggable x={spill89X} y={spill89Y}>
                        {spill89Img && (
                            <KonvaImage image={spill89Img} width={256} height={(256 * (spill89Img.naturalHeight || 256)) / (spill89Img.naturalWidth || 256)} />
                        )}
                    </Group>
                </Layer>

                {/* Optional freehand drawing */}
                {drawingEnabled && (
                    <Layer>
                        {lines.map((line, i) => (
                            <KonvaLine key={i} points={line.points} stroke="#5b4636" strokeWidth={3} tension={0.5} lineCap="round" lineJoin="round" />
                        ))}
                    </Layer>
                )}
            </Stage>

            {/* Top-right controls: download */}
            <div className="absolute top-2 right-2 flex gap-2">
                <button className="form-button" onClick={() => exportPng('ticket.png')}>download (konva)</button>
            </div>
        </div>
    );
}

// Resolve Tailwind-like token to CSS color value for Konva background fill
function getComputedStyleColor(token: string): string {
    // SSR guard: fall back to white when document/window are unavailable
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return '#ffffff';
    }
    // Create a temp element to leverage the existing tailwind class
    const temp = document.createElement('div');
    temp.style.display = 'none';
    temp.className = `bg-${token}`;
    document.body.appendChild(temp);
    const style = window.getComputedStyle(temp);
    const color = style.backgroundColor || '#ffffff';
    document.body.removeChild(temp);
    return color;
}


