import { useEffect, useRef } from 'react';

interface DrawCanvasProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    active: boolean;
    className?: string;
    strokeColor?: string;
    strokeWidth?: number;
    jitter?: number;
}

export default function DrawCanvas({ 
    containerRef, 
    active,
    className = '',
    strokeColor = '#4B3732',
    strokeWidth = 3,
    jitter = 2.0
}: DrawCanvasProps) {
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<Array<{ points: Array<{ x: number; y: number }> }>>([]);

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
            drawCtx.lineCap = 'round';
            drawCtx.lineJoin = 'round';
            drawCtx.strokeStyle = strokeColor;
            drawCtx.lineWidth = strokeWidth;
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

        function handleDown(e: MouseEvent | TouchEvent) {
            if (!active || !drawCtx) return;
            drawing = true;
            const { x, y } = getPos(e);
            strokesRef.current.push({ points: [{ x, y }] });
        }

        function handleMove(e: MouseEvent | TouchEvent) {
            if (!drawing || !active || !drawCtx) return;
            const { x, y } = getPos(e);
            const strokes = strokesRef.current;
            const current = strokes[strokes.length - 1];
            if (current) {
                const last = current.points[current.points.length - 1];
                if (Math.hypot(last.x - x, last.y - y) > 10) {
                    current.points.push({ x, y });
                    renderCurrentFrame();
                }
            }
        }

        function handleUp() {
            drawing = false;
        }

        function handleLeave() {
            drawing = false;
        }

        function renderCurrentFrame() {
            if (!drawCtx || !drawCanvas) return;
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

            const strokes = strokesRef.current;
            for (let strokeIndex = 0; strokeIndex < strokes.length; strokeIndex++) {
                const stroke = strokes[strokeIndex];
                if (stroke.points.length < 2) continue;
                drawCtx.beginPath();

                const isActiveStroke = drawing && strokeIndex === strokes.length - 1;

                for (let i = 0; i < stroke.points.length - 1; i++) {
                    const p = stroke.points[i];
                    const n = stroke.points[i + 1];

                    if (i === 0) drawCtx.moveTo(p.x, p.y);
                    drawCtx.lineTo(n.x, n.y);
                }
                drawCtx.stroke();
            }
        }

        let lastFrameTime = 0;
        const fps = 4;
        const frameDuration = 1000 / fps;

        function renderJitter(now: number) {
            if (!drawCtx || !drawCanvas) return;
            if (now - lastFrameTime < frameDuration) {
                requestAnimationFrame(renderJitter);
                return;
            }
            lastFrameTime = now;
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

            const strokes = strokesRef.current;
            for (let strokeIndex = 0; strokeIndex < strokes.length; strokeIndex++) {
                const stroke = strokes[strokeIndex];
                if (stroke.points.length < 2) continue;
                drawCtx.beginPath();

                const isActiveStroke = drawing && strokeIndex === strokes.length - 1;

                for (let i = 0; i < stroke.points.length - 1; i++) {
                    const p = stroke.points[i];
                    const n = stroke.points[i + 1];

                    if (isActiveStroke) {
                        if (i === 0) drawCtx.moveTo(p.x, p.y);
                        drawCtx.lineTo(n.x, n.y);
                    } else {
                        const jx1 = (Math.random() - 0.5) * jitter * 2;
                        const jy1 = (Math.random() - 0.5) * jitter * 2;
                        const jx2 = (Math.random() - 0.5) * jitter * 2;
                        const jy2 = (Math.random() - 0.5) * jitter * 2;

                        if (i === 0) drawCtx.moveTo(p.x + jx1, p.y + jy1);
                        drawCtx.lineTo(n.x + jx2, n.y + jy2);
                    }
                }
                drawCtx.stroke();
            }

            requestAnimationFrame(renderJitter);
        }

        resizeCanvas();
        requestAnimationFrame(renderJitter);

        drawCanvas.style.pointerEvents = active ? 'auto' : 'none';
        drawCanvas.addEventListener('mousedown', handleDown);
        drawCanvas.addEventListener('mousemove', handleMove);
        drawCanvas.addEventListener('mouseup', handleUp);
        drawCanvas.addEventListener('mouseleave', handleLeave);
        drawCanvas.addEventListener('touchstart', handleDown, { passive: true });
        drawCanvas.addEventListener('touchmove', handleMove, { passive: true });
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
    }, [active, containerRef, strokeColor, strokeWidth, jitter]);

    useEffect(() => {
        const drawCanvas = drawCanvasRef.current;
        if (!drawCanvas) return;
        drawCanvas.style.pointerEvents = active ? 'auto' : 'none';
    }, [active]);

    return (
        <canvas 
            ref={drawCanvasRef}
            className={className}
            aria-hidden="true"
        />
    );
}

