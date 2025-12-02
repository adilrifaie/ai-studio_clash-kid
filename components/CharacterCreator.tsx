import React, { useState } from 'react';
import { AspectRatio, CharacterAttributes, ImageSize, SavedCharacter } from '../types';
import { generateCharacterImage } from '../services/geminiService';

interface Props {
  onSave: (char: SavedCharacter) => void;
  onBack: () => void;
}

const CharacterCreator: React.FC<Props> = ({ onSave, onBack }) => {
  const [attributes, setAttributes] = useState<CharacterAttributes>({
    classification: 'Ground Tank (Güçlü Dev)',
    element: 'Fire (Ateş)',
    weapon: 'Giant Hammer (Dev Çekiç)'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Prompt engineered for Clash style based on mechanics
      const prompt = `A 3D render of a Supercell Clash Royale character. 
      Class: ${attributes.classification.split('(')[0].trim()}. 
      Element theme: ${attributes.element.split('(')[0].trim()}. 
      Holding a ${attributes.weapon.split('(')[0].trim()}. 
      Cute, stylized, vibrant colors, game asset style.`;
      
      const img = await generateCharacterImage(prompt, ImageSize.S_1K, AspectRatio.SQUARE);
      setGeneratedImage(img);
    } catch (e) {
      alert("Oops! Magic failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      // Extract simple name from classification for the default name
      const typeName = attributes.classification.split(' ')[0]; 
      onSave({
        id: Date.now().toString(),
        name: `${typeName} ${Math.floor(Math.random() * 100)}`,
        imageUrl: generatedImage,
        attributes,
        createdAt: Date.now()
      });
    }
  };

  // Categories based on Army Mechanics
  const classifications = [
    { label: "Strong Tank (Güçlü Tank)", value: "Ground Tank" },
    { label: "Fast Runner (Hızlı Koşucu)", value: "Fast Sprinter" },
    { label: "Sharp Shooter (Nişancı)", value: "Ranged Shooter" },
    { label: "Sky Flyer (Uçan Birlik)", value: "Flying Unit" }
  ];

  const elements = [
    { label: "Fire (Ateş)", value: "Fire", color: "bg-orange-500" },
    { label: "Ice (Buz)", value: "Ice", color: "bg-cyan-400" },
    { label: "Electro (Elektrik)", value: "Electro", color: "bg-purple-500" },
    { label: "Nature (Doğa)", value: "Earth", color: "bg-green-600" },
    { label: "Dark Elixir (Kara İksir)", value: "Dark Magic", color: "bg-gray-800" }
  ];

  const weapons = [
    { label: "Sword (Kılıç)", value: "Iron Sword" },
    { label: "Bow (Yay)", value: "Golden Bow" },
    { label: "Magic Staff (Asa)", value: "Crystal Staff" },
    { label: "Big Hammer (Çekiç)", value: "War Hammer" },
    { label: "Bombs (Bomba)", value: "Round Bombs" }
  ];

  return (
    <div className="flex flex-col items-center p-4 w-full max-w-5xl mx-auto animate-fade-in">
      <div className="bg-clash-wood border-4 border-clash-stone rounded-3xl p-6 w-full text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold border-b-4 border-red-800 transition-transform active:scale-95">
             Geri
          </button>
          <h2 className="text-2xl md:text-4xl font-clash text-clash-yellow text-shadow-md text-center">Kahraman Yarat (Create Hero)</h2>
          <div className="w-16"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            
            {/* 1. Classification */}
            <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
              <label className="block text-clash-blue font-bold text-xl mb-3">🛡️ Birlik Sınıfı (Army Class)</label>
              <div className="grid grid-cols-2 gap-2">
                {classifications.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAttributes({...attributes, classification: c.label})}
                    className={`p-3 rounded-lg font-bold text-sm transition-all border-b-4 ${attributes.classification === c.label 
                      ? 'bg-clash-yellow text-black border-yellow-700 scale-105' 
                      : 'bg-gray-700 border-gray-900 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Elements */}
            <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
              <label className="block text-clash-blue font-bold text-xl mb-3">⚡ Element (Power)</label>
              <div className="flex flex-wrap gap-2">
                {elements.map((el) => (
                  <button
                    key={el.value}
                    onClick={() => setAttributes({...attributes, element: el.label})}
                    className={`flex-1 min-w-[80px] py-2 rounded-lg font-bold text-sm transition-all border-b-4 ${el.color} ${attributes.element === el.label 
                      ? 'border-white ring-2 ring-white scale-110 z-10' 
                      : 'border-black/50 opacity-80 hover:opacity-100'}`}
                  >
                    {el.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Weapon */}
            <div className="bg-black/30 p-4 rounded-xl border-2 border-clash-stone">
              <label className="block text-clash-blue font-bold text-xl mb-3">⚔️ Silah Seçimi (Weapon)</label>
              <select 
                value={attributes.weapon}
                onChange={(e) => setAttributes({...attributes, weapon: e.target.value})}
                className="w-full p-3 rounded-xl bg-white text-gray-900 font-bold border-4 border-clash-orange text-lg focus:outline-none"
              >
                {weapons.map(w => (
                  <option key={w.value} value={w.label}>{w.label}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-clash text-3xl py-4 rounded-xl border-b-8 border-green-800 active:border-b-0 active:translate-y-2 transition-all shadow-lg mt-4"
            >
              {loading ? 'YARATILIYOR...' : 'YARAT! (GENERATE)'}
            </button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center bg-black/40 rounded-xl p-4 min-h-[500px] border-4 border-dashed border-white/20 relative">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin text-8xl mb-4">⚙️</div>
                <p className="text-clash-yellow animate-pulse">İksirler karıştırılıyor...</p>
              </div>
            ) : generatedImage ? (
              <div className="relative group w-full h-full flex flex-col items-center justify-center">
                <img src={generatedImage} alt="Generated" className="rounded-xl shadow-2xl w-full h-full object-contain max-h-[600px] drop-shadow-2xl" />
                <button 
                  onClick={handleSave}
                  className="absolute bottom-4 bg-clash-yellow text-black font-clash text-xl px-10 py-4 rounded-full border-4 border-white hover:scale-110 transition-transform shadow-xl hover:shadow-2xl"
                >
                  KAYDET (SAVE)
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 opacity-60">
                <p className="text-8xl mb-4">👑</p>
                <p className="text-xl">Kahraman özellikleri seç ve yarat!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;