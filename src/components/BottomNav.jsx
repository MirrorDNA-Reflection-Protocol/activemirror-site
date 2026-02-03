/**
 * ⟡ Bottom Navigation Bar
 * Mobile-friendly tab navigation for the Intelligence Suite
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Brain, Users, Target, Send } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/mirror', label: 'Mirror', icon: MessageCircle },
    { path: '/scan', label: 'Scan', icon: Brain },
    { path: '/twins', label: 'Twins', icon: Users },
    { path: '/brief', label: 'Brief', icon: Target },
    { path: '/cast', label: 'Cast', icon: Send },
];

const BottomNav = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.04] bg-[#08080a]/90 backdrop-blur-xl safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-1">
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const isActive = currentPath === path || currentPath.startsWith(path + '/');

                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                                isActive
                                    ? 'text-white'
                                    : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-all ${
                                isActive ? 'bg-white/10' : ''
                            }`}>
                                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={`text-[10px] font-medium tracking-wide ${
                                isActive ? 'opacity-100' : 'opacity-70'
                            }`}>
                                {label}
                            </span>
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white/60" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
