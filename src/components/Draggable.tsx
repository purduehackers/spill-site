// Draggable wrapper component

import React, { useRef, type ReactNode } from "react";
import { motion, useDragControls } from "motion/react";

interface DraggableProps {
  children: ReactNode;
  className?: string;
  zIndex?: number;
}

export default function Draggable ({ children, className, zIndex = 50 }: DraggableProps) {
    const dragControls = useDragControls();
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.PointerEvent) => {
        // Check if the clicked element or its parent has the "handle" class
        const target = e.target as HTMLElement;
        
        if (target.closest(".handle")) {
            dragControls.start(e);
        }
    };

    return (
        <motion.div
            ref={wrapperRef}
            className={`relative ${className || ""}`}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.5}
            dragMomentum={false}
            dragConstraints={false}
            whileDrag={{ scale: 1, zIndex: zIndex }}
            onPointerDown={handleMouseDown}
            onDragStart={(e) => { e.preventDefault(); }}
            style={{ 
                touchAction: "none",
                zIndex: zIndex,
            }}
        >
            {children}
        </motion.div>
    );
};