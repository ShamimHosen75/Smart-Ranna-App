
import React from 'react';
import Logo from './Logo';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
    };
     const iconSizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="relative flex justify-center items-center" role="status" aria-label="Loading...">
            <div className={`
                ${sizeClasses[size]}
                border-4
                border-orange-500/20
                border-t-orange-500
                rounded-full
                animate-spin
            `}></div>
            <div className="absolute">
                <Logo className={`${iconSizeClasses[size]}`} />
            </div>
        </div>
    );
};

export default Spinner;
