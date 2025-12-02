import React, { useEffect, useState } from 'react';
import { SavedCharacter } from '../types';
import { generateBilsemHint } from '../services/geminiService';

interface Props {
  savedCharacters: SavedCharacter[];
  onBack: () => void;
}

interface GameState {
  clues: Array<{ chars: SavedCharacter[]; numbers: number[] }>;
  question: { chars: SavedCharacter[]; answer: string };
  options: string[];
  charMap: Record<string, number>;
}

const BilsemGame: React.FC<Props> = ({ savedCharacters, onBack }) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hint, setHint] = useState<string>("");

  useEffect(() => {
    if (savedCharacters.length >= 3) {
      generateNewQuestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCharacters]);

  const generateNewQuestion = () => {
    // 1. Select 3 random unique characters
    const shuffledChars = [...savedCharacters].sort(() => 0.5 - Math.random());
    const gameChars = shuffledChars.slice(0, 3);
    
    // 2. Assign random digits (1-9) to each character
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random()).slice(0, 3);
    const charMap: Record<string, number> = {};
    gameChars.forEach((char, idx) => {
      charMap[char.id] = digits[idx];
    });

    // 3. Generate 3 Pattern Clues (Cipher Rows)
    // Each row shows a combination of 2 or 3 characters and their corresponding number sequence
    const clues = [];
    for (let i = 0; i < 3; i++) {
      // Pick 2 or 3 random characters from the set for this clue row
      const rowChars = [...gameChars].sort(() => 0.5 - Math.random()).slice(0, Math.random() > 0.5 ? 2 : 3);
      const rowNumbers = rowChars.map(c => charMap[c.id]);
      clues.push({ chars: rowChars, numbers: rowNumbers });
    }

    // 4. Generate Question (Different combination)
    const questionChars = [...gameChars].sort(() => 0.5 - Math.random()); // Use all 3 for question usually
    const correctAnswer = questionChars.map(c => charMap[c.id]).join('');

    // 5. Generate Options
    const options = new Set<string>();
    options.add(correctAnswer);
    while (options.size < 4) {
      // Generate random wrong answer with same length using same digits
      const shuffledDigits = [...digits].sort(() => 0.5 - Math.random());
      options.add(shuffledDigits.join(''));
    }

    setGame({
      clues,
      question: { chars: questionChars, answer: correctAnswer },
      options: Array.from(options).sort(() => 0.5 - Math.random()),
      charMap
    });
    
    setSelectedOption(null);
    setFeedback(null);
    setHint("");

    generateBilsemHint(`Cipher puzzle. Match characters to numbers.`).then(setHint);
  };

  const handleCheck = (val: string) => {
    if (!game) return;
    setSelectedOption(val);
    if (val === game.question.answer) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  if (savedCharacters.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-8 bg-clash-stone/90 rounded-xl m-4 border-4 border-clash-wood max-w-lg mx-auto mt-20">
        <h2 className="text-3xl font-clash mb-4">Oops!</h2>
        <p className="text-xl mb-6 text-center">Bu oyunu oynamak için en az 3 karakter yaratmalısın!<br/>(You need 3 characters to play!)</p>
        <button onClick={onBack} className="bg-clash-yellow text-black px-6 py-3 rounded-xl font-bold">Geri Dön</button>
      </div>
    );
  }

  if (!game) return <div className="text-white text-center mt-20 font-clash text-2xl">Loading Puzzle...</div>;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-4 h-[90vh]">
      <div className="bg-clash-blue border-4 border-white rounded-3xl w-full h-full shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-black/10">
          <button onClick={onBack} className="bg-white text-clash-blue px-4 py-2 rounded-xl font-bold border-b-4 border-blue-200 hover:scale-105 transition-transform">
             Çıkış
          </button>
          <h2 className="text-2xl md:text-3xl font-clash text-white drop-shadow-md text-center">Şifre Çözme (Cipher)</h2>
          <div className="w-16"></div>
        </div>

        {/* Game Area - Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT: Clues (İpuçları) */}
          <div className="w-full md:w-2/5 bg-black/20 p-4 border-b-4 md:border-b-0 md:border-r-4 border-white/20 overflow-y-auto">
            <div className="bg-clash-wood rounded-2xl p-4 border-4 border-clash-stone h-full">
              <h3 className="text-clash-yellow font-clash text-xl text-center mb-4 text-shadow-sm border-b-2 border-white/10 pb-2">
                İPUÇLARI (CLUES)
              </h3>
              
              <div className="space-y-4">
                {game.clues.map((clue, idx) => (
                  <div key={idx} className="bg-black/30 p-3 rounded-xl flex items-center justify-between animate-fade-in" style={{animationDelay: `${idx * 150}ms`}}>
                    {/* Images */}
                    <div className="flex gap-2">
                      {clue.chars.map((char, cIdx) => (
                        <img 
                          key={cIdx} 
                          src={char.imageUrl} 
                          className="w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 border-white/50 bg-black/40 object-cover" 
                          alt="clue"
                        />
                      ))}
                    </div>
                    
                    {/* Arrow (Visual separator instead of =) */}
                    <div className="text-white/50 text-2xl font-bold">➜</div>

                    {/* Numbers */}
                    <div className="flex gap-2">
                       {clue.numbers.map((num, nIdx) => (
                         <div key={nIdx} className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white text-black font-clash text-2xl rounded-lg border-b-4 border-gray-300">
                           {num}
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-green-900/40 rounded-xl border border-green-500/30">
                <p className="text-green-300 text-center text-sm font-bold">
                  🧐 {hint || "Karakterlerin sayılarını bul!"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Question (Soru) */}
          <div className="w-full md:w-3/5 p-4 flex flex-col items-center justify-center relative bg-gradient-to-br from-clash-blue to-blue-400">
            
            <div className="bg-white/10 p-6 rounded-3xl border-4 border-white/30 backdrop-blur-sm w-full max-w-lg mb-8">
              <h3 className="text-white font-clash text-2xl text-center mb-6 drop-shadow-md">SORU (QUESTION)</h3>
              
              <div className="flex justify-center items-center gap-2 md:gap-4 mb-8">
                {game.question.chars.map((char, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <img 
                      src={char.imageUrl} 
                      className="w-20 h-20 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-xl bg-black/20 object-cover mb-2" 
                      alt="question"
                    />
                    <div className="w-full h-2 bg-black/20 rounded-full"></div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                 <div className="bg-black/40 px-8 py-2 rounded-full border-2 border-white/20">
                   <span className="text-4xl text-white font-clash tracking-widest">? ? ?</span>
                 </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {game.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCheck(opt)}
                  disabled={feedback === 'correct'}
                  className={`
                    text-3xl md:text-4xl font-clash py-4 rounded-2xl border-b-8 transition-all shadow-lg
                    ${selectedOption === opt 
                      ? feedback === 'correct' ? 'bg-green-500 border-green-800 text-white scale-105' : 'bg-red-500 border-red-800 text-white shake'
                      : 'bg-white text-clash-stone border-gray-300 hover:bg-yellow-50 hover:-translate-y-1'
                    }
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Victory Modal */}
        {feedback === 'correct' && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
             <div className="bg-white p-8 rounded-3xl text-center border-8 border-clash-yellow shadow-[0_0_50px_rgba(255,213,79,0.5)] transform scale-110">
               <div className="text-8xl mb-4 animate-bounce">🌟</div>
               <h3 className="text-4xl font-clash text-green-500 mb-2">HARİKA!</h3>
               <p className="text-gray-500 font-bold text-xl mb-6">Excellent Job!</p>
               <button onClick={generateNewQuestion} className="bg-clash-yellow text-black text-xl px-10 py-4 rounded-2xl font-bold border-b-8 border-yellow-600 hover:brightness-110 active:scale-95 transition-all">
                 Sonraki Soru ➡️
               </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default BilsemGame;