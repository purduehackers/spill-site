import { type ReactNode } from 'react';

interface SpinnerProps {
    className?: string;
    icon?: ReactNode;
}

export default function Spinner({ className, icon }: SpinnerProps) {
    return (
        <div className={`animate-spin ${className || ''}`}>
            {icon}
        </div>
    );
}

