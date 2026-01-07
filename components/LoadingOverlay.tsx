
import React from 'react';

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-t-[#25F4EE] border-r-[#FE2C55] border-b-[#25F4EE] border-l-[#FE2C55] rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-brands fa-tiktok text-3xl text-white"></i>
        </div>
      </div>
      <p className="mt-6 text-white text-xl font-bold tracking-wide animate-pulse uppercase">
        {message}
      </p>
      <p className="text-gray-300 text-sm mt-2 italic">Ajustando as batidas e os filtros...</p>
    </div>
  );
};

export default LoadingOverlay;
