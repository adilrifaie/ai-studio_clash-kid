import React, { useState, useEffect, useRef } from 'react';
import { SavedCharacter } from '../types';

interface Props {
  characters: SavedCharacter[];
  onBack: () => void;
}

const Gallery3D: React.FC<Props> = ({ characters, onBack }) => {
  const [selectedChar, setSelectedChar] = useState<SavedCharacter | null>(null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset view when opening a character
  useEffect(() => {
    if (selectedChar) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation({ x: 0, y: 0 });
    }
  }, [selectedChar]);

  // Handle Dragging (Pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      // Pan Logic
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // 3D Tilt Logic (Hologram Effect)
      // Calculates rotation based on cursor position relative to window center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const percentX = (e.clientX - centerX) / centerX; // -1 to 1
      const percentY = (e.clientY - centerY) / centerY; // -1 to 1
      
      setRotation({
        x: -percentY * 15, // Tilt X (Up/Down)
        y: percentX * 15   // Tilt Y (Left/Right)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with scroll
    const newScale = Math.max(0.5, Math.min(4, scale - e.deltaY * 0.001));
    setScale(newScale);
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const zoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation({ x: 0, y: 0 });
  };

  if (!selectedChar) {
    return (
      <div className="p-8 w-full max-w-7xl mx-auto animate-fade-in pb-20">
         <div className="flex justify-between items-center mb-8 bg-clash-wood p-4 rounded-2xl border-4 border-clash-stone shadow-lg">
            <button onClick={onBack} className="bg-white text-black px-6 py-2 rounded-xl font-bold border-b-4 border-gray-400 hover:scale-105 transition-transform">
              ⬅️ Geri (Back)
            </button>
            <h2 className="text-3xl md:text-4xl text-white font-clash text-shadow text-center">Karakter Koleksiyonu</h2>
            <div className="w-20"></div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {characters.map((char, index) => (
              <div 
                key={char.id} 
                onClick={() => setSelectedChar(char)}
                className="bg-clash-blue p-3 rounded-3xl border-4 border-white cursor-pointer hover:scale-105 hover:-rotate-1 transition-all shadow-2xl group relative"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="bg-black/20 rounded-2xl overflow-hidden aspect-square border-2 border-black/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-2 z-20">
                    <p className="text-white font-clash text-lg drop-shadow-md">{char.name}</p>
                    <p className="text-clash-yellow text-xs font-bold uppercase">{char.attributes.classification}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-center">
                   <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-b-2 border-green-700">Görüntüle (View)</span>
                </div>
              </div>
            ))}
            
            {characters.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-black/40 rounded-3xl border-4 border-dashed border-white/20 text-white">
                <div className="text-8xl mb-4">🤷‍♂️</div>
                <p className="text-2xl font-bold mb-4">Henüz karakter yok!</p>
                <button onClick={onBack} className="bg-clash-yellow text-black px-6 py-3 rounded-xl font-bold border-b-4 border-yellow-600">
                  Hemen Yarat!
                </button>
              </div>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden">
      
      {/* Interactive 3D Viewport */}
      <div 
        ref={containerRef}
        className="flex-1 relative cursor-move overflow-hidden flex items-center justify-center perspective-1000"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          perspective: '1000px', // Critical for 3D effect
          backgroundImage: 'radial-gradient(circle at center, #2a2a2a 0%, #000 100%)'
        }}
      >
        {/* Background Grid for spatial reference */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{
               backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
               backgroundSize: '50px 50px',
               transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)` // Parallax background
             }}>
        </div>

        {/* Character Container with 3D Transforms */}
        <div 
          className="relative transition-transform duration-75 ease-out will-change-transform"
          style={{
            transform: `
              translate3d(${position.x}px, ${position.y}px, 0) 
              scale(${scale}) 
              rotateX(${rotation.x}deg) 
              rotateY(${rotation.y}deg)
            `,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Shadow for depth */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-40 h-10 bg-black/50 blur-xl rounded-[100%] transition-opacity duration-300"
               style={{ opacity: scale > 1.5 ? 0 : 0.6 }}></div>
               
          <img 
            src={selectedChar.imageUrl} 
            alt="3D View"
            className="max-h-[70vh] w-auto drop-shadow-2xl select-none pointer-events-none"
          />
        </div>

        {/* Instructions Overlay (fades out) */}
        <div className="absolute bottom-8 text-white/50 text-sm font-bold pointer-events-none animate-pulse">
           🖱️ Sürükle (Drag) • 🔍 Tekerlek (Zoom) • ✨ Çevir (Tilt)
        </div>
      </div>

      {/* Controls Overlay - TOP LEFT Zoom Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-50">
        <button onClick={zoomIn} className="bg-white text-black w-12 h-12 rounded-xl border-b-4 border-gray-300 font-bold text-2xl shadow-lg hover:bg-gray-100 active:border-b-0 active:translate-y-1">
          +
        </button>
        <button onClick={zoomOut} className="bg-white text-black w-12 h-12 rounded-xl border-b-4 border-gray-300 font-bold text-2xl shadow-lg hover:bg-gray-100 active:border-b-0 active:translate-y-1">
          -
        </button>
        <button onClick={resetView} className="bg-clash-blue text-white w-12 h-12 rounded-xl border-b-4 border-blue-600 font-bold text-lg shadow-lg hover:bg-blue-400 active:border-b-0 active:translate-y-1 flex items-center justify-center">
          ↺
        </button>
      </div>

      {/* Close Button - TOP RIGHT */}
      <button 
        onClick={() => setSelectedChar(null)}
        className="absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl border-b-4 border-red-800 font-bold text-lg shadow-lg hover:bg-red-600 active:border-b-0 active:translate-y-1 z-50"
      >
        Kapat (Close)
      </button>

      {/* Character Info Panel (Bottom) */}
      <div className="bg-clash-wood border-t-4 border-clash-stone p-4 flex flex-col md:flex-row justify-between items-center text-white relative z-40">
        <div className="mb-2 md:mb-0">
           <h2 className="text-3xl font-clash text-clash-yellow">{selectedChar.name}</h2>
           <p className="text-gray-300 text-sm">{selectedChar.attributes.classification} • {selectedChar.attributes.element}</p>
        </div>
        <div className="flex gap-4">
           {/* Static Badges for Stats */}
           <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-center">
              <div className="text-xs text-gray-400 font-bold">POWER</div>
              <div className="text-clash-orange font-clash text-xl">999</div>
           </div>
           <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10 text-center">
              <div className="text-xs text-gray-400 font-bold">LEVEL</div>
              <div className="text-green-400 font-clash text-xl">MAX</div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Gallery3D;