import React from 'react';

export default function MirrorLogo({ className = "w-8 h-8" }) {
    return (
        <img
            src="/active-mirror-logo.jpg"
            alt="Active Mirror"
            className={`${className} filter invert brightness-100 mix-blend-screen object-contain`}
        />
    );
}
