import React, { useState, useEffect } from 'react';
import { AppView, SavedCharacter, SavedDrawing } from './types';
import CharacterCreator from './components/CharacterCreator';
import BilsemGame from './components/BilsemGame';
import ColoringBook from './components/ColoringBook';
import Gallery3D from './components/Gallery3D';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([]);

  // Load from local storage
  useEffect(() => {
    const savedChars = localStorage.getItem('clash-kids-chars');
    if (savedChars) {
      try {
        setSavedCharacters(JSON.parse(savedChars));
      } catch (e) {
        console.error("Failed to load chars", e);
      }
    }
    const savedDraw = localStorage.getItem('clash-kids-drawings');
    if (savedDraw) {
      try {
        setSavedDrawings(JSON.parse(savedDraw));
      } catch (e) {
        console.error("Failed to load drawings", e);
      }
    }
  }, []);

  const saveCharacter = (char: SavedCharacter) => {
    const updated = [char, ...savedCharacters];
    setSavedCharacters(updated);
    localStorage.setItem('clash-kids-chars', JSON.stringify(updated));
    setView(AppView.HOME);
  };

  const saveDrawing = (drawing: SavedDrawing) => {
    const updated = [drawing, ...savedDrawings];
    setSavedDrawings(updated);
    localStorage.setItem('clash-kids-drawings', JSON.stringify(updated));
    setView(AppView.HOME);
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 gap-8 animate-fade-in pb-20">
      <div className="text-center mt-8 mb-4">
        <h1 className="text-6xl md:text-8xl font-clash text-clash-yellow drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] stroke-black" style={{WebkitTextStroke: '2px #000'}}>
          CLASH KIDS
        </h1>
        <p className="text-white text-xl font-bold bg-black/50 px-4 py-1 rounded-full inline-block mt-2">Turkiye Edition</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <MenuButton 
          title="Karakter Yarat" 
          subtitle="Create Character" 
          color="bg-green-500" 
          icon="🛡️" 
          onClick={() => setView(AppView.CREATOR)} 
        />
        <MenuButton 
          title="Bilsem Oyunu" 
          subtitle="Logic Puzzle" 
          color="bg-clash-blue" 
          icon="🧩" 
          onClick={() => setView(AppView.BILSEM)} 
        />
        <MenuButton 
          title="Bina İnşa Et" 
          subtitle="Build & Color" 
          color="bg-purple-500" 
          icon="🏗️" 
          onClick={() => setView(AppView.COLORING)} 
        />
        <MenuButton 
          title="Koleksiyon (3D)" 
          subtitle="My Gallery" 
          color="bg-clash-orange" 
          icon="💎" 
          onClick={() => setView(AppView.GALLERY)} 
        />
      </div>

      {/* Gallery Strips */}
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Characters */}
        {savedCharacters.length > 0 && (
          <div className="bg-black/40 p-4 rounded-2xl border-2 border-white/20 w-full overflow-x-auto whitespace-nowrap backdrop-blur-sm">
            <p className="text-clash-yellow mb-2 font-clash text-lg ml-2 drop-shadow-md">Kahramanlar (Heroes):</p>
            <div className="flex gap-4 pb-2">
              {savedCharacters.map(c => (
                <div key={c.id} className="relative group cursor-pointer hover:scale-110 transition-transform">
                   <img src={c.imageUrl} className="w-20 h-20 rounded-xl border-2 border-clash-yellow bg-gray-800 object-cover shadow-lg" alt={c.name} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drawings */}
        {savedDrawings.length > 0 && (
          <div className="bg-black/40 p-4 rounded-2xl border-2 border-white/20 w-full overflow-x-auto whitespace-nowrap backdrop-blur-sm">
            <p className="text-purple-300 mb-2 font-clash text-lg ml-2 drop-shadow-md">Çizimler (Drawings):</p>
            <div className="flex gap-4 pb-2">
              {savedDrawings.map(d => (
                <div key={d.id} className="relative group cursor-pointer hover:scale-110 transition-transform">
                   <img src={d.imageUrl} className="w-20 h-20 rounded-xl border-2 border-white bg-white object-contain shadow-lg" alt="drawing" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-body text-gray-900 selection:bg-clash-yellow selection:text-black">
      {view === AppView.HOME && renderHome()}
      {view === AppView.CREATOR && <CharacterCreator onSave={saveCharacter} onBack={() => setView(AppView.HOME)} />}
      {view === AppView.BILSEM && <BilsemGame savedCharacters={savedCharacters} onBack={() => setView(AppView.HOME)} />}
      {view === AppView.COLORING && <ColoringBook onSave={saveDrawing} onBack={() => setView(AppView.HOME)} />}
      {view === AppView.GALLERY && <Gallery3D characters={savedCharacters} onBack={() => setView(AppView.HOME)} />}
    </div>
  );
};

const MenuButton: React.FC<{title: string, subtitle: string, color: string, icon: string, onClick: () => void}> = ({
  title, subtitle, color, icon, onClick
}) => (
  <button 
    onClick={onClick}
    className={`${color} group relative overflow-hidden rounded-2xl border-b-8 border-black/20 p-6 transition-transform hover:-translate-y-1 hover:shadow-2xl active:translate-y-1 active:border-b-0`}
  >
    <div className="absolute -right-4 -top-4 text-8xl opacity-20 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="relative z-10 text-left">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-2xl md:text-3xl font-clash text-white drop-shadow-sm">{title}</h3>
      <p className="text-white/80 font-bold text-sm">{subtitle}</p>
    </div>
  </button>
);

export default App;