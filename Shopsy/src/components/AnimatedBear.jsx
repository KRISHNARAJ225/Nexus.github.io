import React, { useState, useEffect, useRef } from 'react';

const AnimatedBear = ({ color = 'white' }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
      
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isRed = color === 'red';
  
  // Colors based on the bear type
  const bearColor = isRed ? '#ef4444' : '#ffffff'; // red-500 or white
  const shadowColor = isRed ? '#dc2626' : '#f1f5f9'; // darker red or slate-50
  const earInnerColor = isRed ? '#fca5a5' : '#fbcfe8'; // lighter red/pink or pink-200
  const snoutColor = isRed ? '#fef2f2' : '#f8fafc'; // pale red or slate-50
  const noseColor = isRed ? '#7f1d1d' : '#0f172a'; // dark red or slate-900

  // Animation calculation
  const eyeMoveX = mousePos.x * 12;
  const eyeMoveY = mousePos.y * 12;
  
  const pupilMoveX = mousePos.x * 6;
  const pupilMoveY = mousePos.y * 6;

  const snoutMoveX = mousePos.x * 8;
  const snoutMoveY = mousePos.y * 8;

  const headRotateX = mousePos.y * -10;
  const headRotateY = mousePos.x * 10;

  const earMoveX = mousePos.x * -4;
  const earMoveY = mousePos.y * -4;

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center relative overflow-hidden rounded-[20px] transition-colors duration-500 ${isRed ? 'bg-red-50' : 'bg-slate-50'}`}
    >
      {/* Background decoration */}
      <div className={`absolute w-[150%] h-[150%] rounded-full -top-[50%] -z-0 opacity-20 transition-colors duration-500 ${isRed ? 'bg-red-200' : 'bg-blue-100'}`}></div>

      {/* Floating Speech Bubble */}
      <div className="absolute top-12 z-20 transition-all duration-300 transform translate-y-0 scale-100">
        <div className="bg-white text-slate-800 px-6 py-3 rounded-2xl rounded-bl-none font-bold text-lg shadow-xl relative inline-block">
          {isRed ? "Hi! Let's register! 👋" : "Hi! Welcome back! 👋"}
          <div className="absolute -bottom-2 -left-0.5 w-4 h-4 bg-white border-b-2 border-l-2 border-transparent transform -rotate-45"></div>
        </div>
      </div>

      {/* Bear Container */}
      <div 
        className="relative w-64 h-64 mt-12 z-10"
        style={{
          transform: `perspective(1000px) rotateX(${headRotateX}deg) rotateY(${headRotateY}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Left Ear */}
        <div 
          className="absolute top-0 -left-4 w-20 h-20 rounded-full shadow-md z-0 overflow-hidden"
          style={{ 
            backgroundColor: shadowColor,
            transform: `translate(${earMoveX}px, ${earMoveY}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full" style={{ backgroundColor: bearColor }}></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full" style={{ backgroundColor: earInnerColor }}></div>
        </div>

        {/* Right Ear */}
        <div 
          className="absolute top-0 -right-4 w-20 h-20 rounded-full shadow-md z-0 overflow-hidden"
          style={{ 
            backgroundColor: shadowColor,
            transform: `translate(${earMoveX}px, ${earMoveY}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full" style={{ backgroundColor: bearColor }}></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full" style={{ backgroundColor: earInnerColor }}></div>
        </div>

        {/* Head */}
        <div 
          className="absolute inset-x-0 bottom-4 top-10 rounded-[50%_50%_45%_45%] shadow-xl z-10 flex flex-col items-center border-4"
          style={{ 
            backgroundColor: bearColor,
            borderColor: isRed ? '#ef4444' : '#ffffff' 
          }}
        >
          
          {/* Eyes Container */}
          <div 
            className="flex gap-8 absolute top-12"
            style={{
              transform: `translate(${eyeMoveX}px, ${eyeMoveY}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Left Eye */}
            <div className={`w-10 h-14 rounded-[50%] flex items-center justify-center relative shadow-inner overflow-hidden ${isRed ? 'bg-red-900/10' : 'bg-slate-200/50'}`}>
              <div className="absolute inset-[3px] bg-white rounded-[50%]"></div>
              {/* Pupil */}
              <div 
                className={`w-5 h-6 rounded-full absolute ${isRed ? 'bg-red-950' : 'bg-slate-800'}`}
                style={{
                  transform: `translate(${pupilMoveX}px, ${pupilMoveY}px)`,
                  transition: 'transform 0.05s ease-out'
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>

            {/* Right Eye */}
            <div className={`w-10 h-14 rounded-[50%] flex items-center justify-center relative shadow-inner overflow-hidden ${isRed ? 'bg-red-900/10' : 'bg-slate-200/50'}`}>
              <div className="absolute inset-[3px] bg-white rounded-[50%]"></div>
              {/* Pupil */}
              <div 
                className={`w-5 h-6 rounded-full absolute ${isRed ? 'bg-red-950' : 'bg-slate-800'}`}
                style={{
                  transform: `translate(${pupilMoveX}px, ${pupilMoveY}px)`,
                  transition: 'transform 0.05s ease-out'
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>
          </div>

          {/* Snout Container */}
          <div 
            className="absolute top-24 w-28 h-20 rounded-[50%_50%_50%_50%] shadow-sm flex flex-col items-center"
            style={{
              backgroundColor: snoutColor,
              transform: `translate(${snoutMoveX}px, ${snoutMoveY}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Nose */}
            <div 
              className="w-10 h-6 mt-2 rounded-[50%_50%_60%_60%] shadow-inner relative"
              style={{ backgroundColor: noseColor }}
            >
              <div className="absolute top-1 left-2 w-3 h-1.5 bg-white/40 rounded-full rotate-[-15deg]"></div>
            </div>

            {/* Mouth */}
            <div className="flex mt-2">
              <div className="w-4 h-4 border-b-2 border-r-2 border-black/80 rounded-br-full transform rotate-45 -mr-0.5"></div>
              <div className="w-4 h-4 border-b-2 border-l-2 border-black/80 rounded-bl-full transform -rotate-45 -ml-0.5"></div>
            </div>
          </div>

          {/* Cheeks */}
          <div className="absolute top-24 left-6 w-8 h-4 bg-pink-300 rounded-full blur-[4px] opacity-60"></div>
          <div className="absolute top-24 right-6 w-8 h-4 bg-pink-300 rounded-full blur-[4px] opacity-60"></div>
        </div>

        {/* Body/Shoulders */}
        <div 
          className="absolute -bottom-8 -inset-x-6 h-24 rounded-[50%_50%_0_0] -z-10 shadow-lg"
          style={{ backgroundColor: shadowColor }}
        ></div>
        
      </div>

    </div>
  );
};

export default AnimatedBear;
