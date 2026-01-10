import React, { ReactNode } from 'react';

interface GameCardProps {
  title: string;
  bgColor: string;
  children: ReactNode;
  onClick?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ title, bgColor, children, onClick }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        onClick={onClick}
        className={`relative w-40 h-48 ${bgColor} rounded-lg shadow-xl flex flex-col items-center justify-center cursor-pointer transition-shadow duration-300 hover:shadow-2xl`}
      >
        {/* The children prop is used here to place the custom image/icon/SVG */}
        {children}
        <p className="mt-2 text-center text-lg font-medium text-white">
          {title}
        </p>
      </div>
    </div>
  );
};
