import React, { useRef, useState, useEffect } from 'react';
import { generateColoringPage } from '../services/geminiService';
import { SavedDrawing } from '../types';

interface Props {
  onBack: () => void;
  onSave: (drawing: SavedDrawing) => void;
}

const COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', 
  '#800080', '#FFFFFF', '#000000', '#A52A2A', '#FFC0CB',
  '#4FC3F7', '#8D6E63', '#FF8F00', '#546E7A', '#E91E63'
];

const ColoringBook: React.FC<Props> = ({ onBack, onSave }) => {
  const [step, setStep] = useState<'create' | 'color'>('create');
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Creation Attributes
  const [buildingType, setBuildingType] = useState('Town Hall');
  const [material, setMaterial] = useState('Stone (Taş)');
  const [level, setLevel] = useState('Level 1 (Simple)');

  // Coloring State
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `A 2D line art of a Clash of Clans ${buildingType}. 
      Material: ${material.split('(')[0]}. 
      Complexity: ${level.split('(')[0]}.`;
      
      const imgData = await generateColoringPage(prompt);
      setImageSrc(imgData);
      setStep('color');
    } catch (e) {
      alert("Could not generate coloring page. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDrawing = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave({
        id: Date.now().toString(),
        imageUrl: dataUrl,
        createdAt: Date.now()
      });
    }
  };

  // Initialize Canvas with Image
  useEffect(() => {
    if (step === 'color' && imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw white background first
          ctx.fillStyle = "white";
          ctx.fillRect(0,0, canvas.width, canvas.height);
          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = imageSrc;
    }
  }, [step, imageSrc]);

  // Drawing Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if(canvas) {
       const ctx = canvas.getContext('2d');
       ctx?.beginPath(); 
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Handle scale if canvas is resized by CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    
    // CRITICAL FIX: Multiply blending preserves black lines while coloring white areas
    ctx.globalCompositeOperation = 'multiply';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Reset to source-over if you were doing other things, 
    // but for continuous drawing multiply is fine here.
  };

  if (step === 'create') {
    return (
      <div className="flex flex-col items-center p-4 w-full max-w-5xl mx-auto animate-fade-in min-h-screen">
        <div className="bg-clash-wood border-4 border-clash-stone rounded-3xl p-6 w-full text-white shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="bg-red-500 px-4 py-2 rounded-xl font-bold border-b-4 border-red-800">
               Geri
            </button>
            <h2 className="text-3xl font-clash text-clash-yellow text-shadow-md text-center">İnşaatçı Üssü (Builder Base)</h2>
            <div className="w-16"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
                <label className="block text-clash-blue font-bold text-xl mb-3">🏠 Bina Tipi (Building)</label>
                <select 
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white text-gray-900 font-bold border-4 border-clash-orange text-lg"
                >
                  <option>Town Hall (Belediye Binası)</option>
                  <option>Archer Tower (Okçu Kulesi)</option>
                  <option>Cannon (Top)</option>
                  <option>Barracks (Kışla)</option>
                  <option>Gold Storage (Altın Deposu)</option>
                  <option>Elixir Collector (İksir Toplayıcı)</option>
                  <option>Clan Castle (Klan Kalesi)</option>
                </select>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
                <label className="block text-clash-blue font-bold text-xl mb-3">🧱 Malzeme (Material)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Wood (Tahta)', 'Stone (Taş)', 'Gold (Altın)', 'Crystal (Kristal)'].map(m => (
                    <button
                      key={m}
                      onClick={() => setMaterial(m)}
                      className={`p-2 rounded-lg font-bold border-b-4 ${material === m ? 'bg-clash-yellow text-black border-yellow-700' : 'bg-gray-700 border-gray-900'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
                <label className="block text-clash-blue font-bold text-xl mb-3">⭐ Seviye (Level)</label>
                <div className="flex gap-2">
                  {['Level 1 (Basit)', 'Level 5 (Orta)', 'Max Level (Efsane)'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 p-2 rounded-lg font-bold border-b-4 text-sm ${level === l ? 'bg-purple-500 text-white border-purple-800' : 'bg-gray-700 border-gray-900'}`}
                    >
                      {l.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-clash text-2xl py-4 rounded-xl border-b-8 border-green-800 active:border-b-0 active:translate-y-2 transition-all mt-4"
              >
                {loading ? 'BİNA ÇİZİLİYOR...' : 'RESMİ ÇİZ (CREATE)'}
              </button>
            </div>

            <div className="flex items-center justify-center bg-black/40 rounded-xl border-4 border-dashed border-white/20 min-h-[400px]">
               <div className="text-center text-gray-400 opacity-60">
                <p className="text-8xl mb-4">🏗️</p>
                <p className="text-xl">Binanı tasarla ve boyamaya başla!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-clash-stone p-4 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-clash-wood p-3 rounded-2xl border-4 border-black/30 mb-4 shadow-xl">
        <button onClick={() => setStep('create')} className="bg-gray-200 text-black px-4 py-2 rounded-xl font-bold border-b-4 border-gray-400 hover:bg-white">
          ⬅️ Yeni Resim
        </button>

        {/* Colors Scrollable */}
        <div className="flex-1 overflow-x-auto mx-4 no-scrollbar">
          <div className="flex gap-2 p-1">
            {COLORS.map(c => (
              <button 
                key={c} 
                onClick={() => setSelectedColor(c)}
                style={{backgroundColor: c}} 
                className={`flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full border-4 transition-transform ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-black/20'}`}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={handleSaveDrawing} 
          className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold border-b-4 border-green-800 hover:bg-green-400 flex items-center gap-2"
        >
          <span>💾</span> <span className="hidden md:inline">Kaydet</span>
        </button>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl border-4 border-dashed border-white/20 p-4 overflow-hidden">
         <div className="relative shadow-2xl bg-white">
            <canvas 
              ref={canvasRef}
              width={800}
              height={800}
              className="w-full h-full max-h-[70vh] object-contain cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
            />
         </div>
      </div>
    </div>
  );
};

export default ColoringBook;