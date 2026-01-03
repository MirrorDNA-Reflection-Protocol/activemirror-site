import React from 'react';

export default function MirrorLogo({ className = "w-8 h-8" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Outer Diamond */}
            <path d="M12 3L3 12L12 21L21 12L12 3Z" />

            {/* Left Input/Reflector (Geometric Square/Bracket) */}
            <path d="M9.5 9.5L7 12L9.5 14.5" />

            {/* Right Output/Signal (Waves) */}
            <path d="M14 8C16.5 8 18.5 10 18.5 12C18.5 14 16.5 16 14 16" />
            <path d="M17 12H17.01" strokeWidth="3" />
        </svg>
    );
}
