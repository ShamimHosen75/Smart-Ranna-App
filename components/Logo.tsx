import React from 'react';

interface LogoProps {
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Smart Ranna Logo"
            role="img"
        >
            <defs>
                <linearGradient id="logo-badge-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F97316"/> {/* Orange */}
                    <stop offset="1" stopColor="#DC2626"/> {/* Red */}
                </linearGradient>
            </defs>
            
            {/* Badge */}
            <circle cx="32" cy="32" r="30" fill="url(#logo-badge-gradient)" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />
            
            {/* Utensils - Gold color */}
            <g fill="#FBBF24" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                {/* Spoon */}
                <g transform="translate(2, 2) rotate(-25 32 32)">
                     <path d="M32 14 C38 14 41 18 41 24 C41 30 38 34 32 34 C26 34 23 30 23 24 C23 18 26 14 32 14Z" stroke="none" />
                     <path d="M32 33 V 50" />
                </g>

                {/* Fork */}
                <g transform="translate(-2, 2) rotate(25 32 32)">
                    <path d="M27 14 V 34" />
                    <path d="M37 14 V 34" />
                    <path d="M32 24 V 50" />
                </g>
            </g>
            
            {/* Digital Effect - subtle circuit lines */}
            <g stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6">
                 <path d="M28 42 L 30 44 L 27 46"/>
                 <path d="M42 35 L 40 37 L 43 39"/>
            </g>
        </svg>
    );
};

export default Logo;
