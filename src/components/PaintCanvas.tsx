import { useEffect, useRef } from 'react';

interface PaintCanvasProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    active: boolean;
    paused?: boolean;
    className?: string;
    strokeColor?: string;
    brushSize?: number;
    brushDensity?: number;
    brushOpacity?: number;
}

type StrokeType = {
    points: Array<{ x: number; y: number }>;
}

export default function PaintCanvas({ 
    containerRef, 
    active,
    paused = false,
    className = '',
    strokeColor = '#4B3732',
    brushSize = 3,
    brushDensity = 8,
    brushOpacity = 1
}: PaintCanvasProps) {
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<Array<StrokeType>>([]);
    const strokeColorRef = useRef<string>(strokeColor);
    const activeRef = useRef<boolean>(active);
    const pausedRef = useRef<boolean>(paused);

    // Initialize canvas and setup event listeners
    useEffect(() => {
        const drawCanvas = drawCanvasRef.current;
        const canvasContainer = containerRef.current;
        if (!drawCanvas || !canvasContainer) return;

        const drawCtx = drawCanvas.getContext('2d');
        if (!drawCtx) return;

        let drawing = false;
        let deviceScale = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

        function resizeCanvas() {
            if (!drawCanvas || !drawCtx || !canvasContainer) return;
            const rect = canvasContainer.getBoundingClientRect();
            drawCanvas.width = Math.floor(rect.width * deviceScale);
            drawCanvas.height = Math.floor(rect.height * deviceScale);
            drawCanvas.style.width = rect.width + 'px';
            drawCanvas.style.height = rect.height + 'px';
            drawCtx.scale(deviceScale, deviceScale);
        }

        function getPos(e: MouseEvent | TouchEvent): { x: number; y: number } {
            if (!canvasContainer) return { x: 0, y: 0 };
            const rect = canvasContainer.getBoundingClientRect();
            let x = 0, y = 0;
            if (window.TouchEvent && e instanceof TouchEvent) {
                const t = e.touches[0] || e.changedTouches[0];
                x = t.clientX - rect.left;
                y = t.clientY - rect.top;
            } else {
                x = (e as MouseEvent).clientX - rect.left;
                y = (e as MouseEvent).clientY - rect.top;
            }
            return { x, y };
        }

        // Map color names to hex values
        const colorNameToHex: Record<string, string> = {
            'paper': '#e0dbd3',
            'moss': '#a0a041',
            'coffee-light': '#896258',
            'sage': '#a0aaa0',
            'matcha': '#6b8034',
            'cream': '#ecdbbf',
            'chocolate': '#744726',
        };

        function colorToRgb(color: string): { r: number; g: number; b: number } | null {
            // First check if it's a color name and convert to hex
            const hex = colorNameToHex[color] || color;
            
            // Then parse as hex
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function drawBrushStamp(x: number, y: number, pressure: number = 1) {
            if (!drawCtx) return;
            
            const rgb = colorToRgb(strokeColorRef.current);
            if (!rgb) return;
            
            const size = brushSize * pressure;
            const baseOpacity = brushOpacity * pressure;
            const lineWidth = Math.max(1, size * 0.1);
            
            drawCtx.save();
            drawCtx.lineCap = 'round';
            drawCtx.lineJoin = 'round';
            
            // Draw multiple overlapping lines to create sketch-like texture
            const numBristles = Math.floor(brushDensity * 2);
            for (let i = 0; i < numBristles; i++) {
                // Random starting position within brush area
                const startAngle = Math.random() * Math.PI * 2;
                const startDistance = Math.random() * (size * 0.3);
                const startX = x + Math.cos(startAngle) * startDistance;
                const startY = y + Math.sin(startAngle) * startDistance;
                
                // Random line direction and length
                const lineAngle = Math.random() * 6;
                const lineLength = size * (0.3 + Math.random() * 0.4);
                const endX = startX + Math.cos(lineAngle) * lineLength;
                const endY = startY + Math.sin(lineAngle) * lineLength;
                
                // Vary opacity and line width for texture
                const opacityVariation = 0.4 + Math.random() * 0.6;
                const opacity = baseOpacity * opacityVariation;
                const currentLineWidth = lineWidth * (0.7 + Math.random() * 0.6);
                
                drawCtx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                drawCtx.lineWidth = currentLineWidth;
                
                // Draw the line
                drawCtx.beginPath();
                drawCtx.moveTo(startX, startY);
                drawCtx.lineTo(endX, endY);
                drawCtx.stroke();
            }
            
            drawCtx.restore();
        }

        function handleDown(e: MouseEvent | TouchEvent) {
            e.preventDefault();
            if (!activeRef.current || pausedRef.current || !drawCtx) return;
            drawing = true;
            const { x, y } = getPos(e);
            strokesRef.current.push({ points: [{ x, y }] });
            drawBrushStamp(x, y, 1);
        }

        function handleMove(e: MouseEvent | TouchEvent) {
            e.preventDefault();
            if (!drawing || !activeRef.current || pausedRef.current || !drawCtx) return;
            const { x, y } = getPos(e);
            const strokes = strokesRef.current;
            const current = strokes[strokes.length - 1];
            if (current) {
                const last = current.points[current.points.length - 1];
                const distance = Math.hypot(last.x - x, last.y - y);
                
                // Draw brush stamps along the path
                if (distance > 2) {
                    const steps = Math.ceil(distance / (brushSize * 0.3));
                    for (let i = 0; i <= steps; i++) {
                        const t = i / steps;
                        const brushX = last.x + (x - last.x) * t;
                        const brushY = last.y + (y - last.y) * t;
                        // Vary pressure slightly for natural feel
                        const pressure = 0.8 + Math.random() * 0.4;
                        drawBrushStamp(brushX, brushY, pressure);
                    }
                    
                    current.points.push({ x, y });
                }
            }
        }

        function handleUp() {
            drawing = false;
        }

        function handleLeave() {
            drawing = false;
        }

        resizeCanvas();
        
        drawCanvas.style.pointerEvents = (activeRef.current && !pausedRef.current) ? 'auto' : 'none';
        drawCanvas.addEventListener('mousedown', handleDown);
        drawCanvas.addEventListener('mousemove', handleMove);
        drawCanvas.addEventListener('mouseup', handleUp);
        drawCanvas.addEventListener('mouseleave', handleLeave);
        drawCanvas.addEventListener('touchstart', handleDown, { passive: false });
        drawCanvas.addEventListener('touchmove', handleMove, { passive: false });
        drawCanvas.addEventListener('touchend', handleUp, { passive: true });

        const resizeObserver = new ResizeObserver(() => {
            deviceScale = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
            resizeCanvas();
        });
        resizeObserver.observe(canvasContainer);

        return () => {
            drawCanvas.removeEventListener('mousedown', handleDown);
            drawCanvas.removeEventListener('mousemove', handleMove);
            drawCanvas.removeEventListener('mouseup', handleUp);
            drawCanvas.removeEventListener('mouseleave', handleLeave);
            drawCanvas.removeEventListener('touchstart', handleDown);
            drawCanvas.removeEventListener('touchmove', handleMove);
            drawCanvas.removeEventListener('touchend', handleUp);
            resizeObserver.disconnect();
        };
    }, [active, containerRef, brushSize, brushDensity, brushOpacity]);

    // Update pointer events when active or paused props change
    useEffect(() => {
        const drawCanvas = drawCanvasRef.current;
        if (!drawCanvas) return;
        drawCanvas.style.pointerEvents = (active && !paused) ? 'auto' : 'none';
    }, [active, paused]);

    // Update strokeColorRef when prop changes
    useEffect(() => {
        strokeColorRef.current = strokeColor;
    }, [strokeColor]);

    // Update activeRef when prop changes
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    // Update pausedRef when prop changes
    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    return (
        <canvas 
            ref={drawCanvasRef}
            className={`absolute top-0 left-0 w-full h-full ${(active && !paused) ? 'cursor-crosshair' : 'pointer-events-none'} ${className}`}
            aria-hidden="true"
        />
    );
}

