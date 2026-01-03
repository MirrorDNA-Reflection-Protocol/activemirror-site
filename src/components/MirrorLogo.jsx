import React from 'react';

export default function MirrorLogo({ className = "w-8 h-8" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M12 2L2 22H22L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 6L4.5 21H19.5L12 6Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            <path d="M12 10L7 20H17L12 10Z" fill="currentColor" fillOpacity="0.8" />
        </svg>
    );
}
