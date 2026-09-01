import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export default function Logo({
  size = 'md',
  showText = false,
  textColor = 'text-slate-900',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-10',
    md: 'w-10 h-14',
    lg: 'w-20 h-28',
    xl: 'w-28 h-40',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official SJC College Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]}`}>
        <img
          src="/sjc-logo.png"
          alt="St. Joseph's College Logo"
          className="w-full h-full object-contain drop-shadow-md"
        />
      </div>
      {showText && (
        <div>
          <h1 className={`font-bold tracking-tight text-lg ${textColor}`}>IQAC Portal</h1>
        </div>
      )}
    </div>
  );
}
