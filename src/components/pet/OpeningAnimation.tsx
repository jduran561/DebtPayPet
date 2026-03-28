/**
 * OpeningAnimation - First-launch egg hatching sequence
 * Phases: appear → wobble → crack → hatch → name
 */

import { useState, useEffect, useRef } from 'react';
import { useConfetti } from '../../hooks/useConfetti';

type Phase = 'appear' | 'wobble' | 'crack' | 'hatch' | 'name';

interface Props {
  onComplete: (name: string) => void;
}

export function OpeningAnimation({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('appear');
  const [name, setName] = useState('Penny');
  const { triggerBig } = useConfetti();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // appear → wobble after 400ms
    timers.push(setTimeout(() => setPhase('wobble'), 400));
    // wobble → crack after 400 + 800ms
    timers.push(setTimeout(() => setPhase('crack'), 1200));
    // crack → hatch after 400 + 800 + 600ms
    timers.push(setTimeout(() => {
      setPhase('hatch');
      triggerBig(window.innerWidth / 2, window.innerHeight / 2);
    }, 1800));
    // hatch → name after 400 + 800 + 600 + 600ms
    timers.push(setTimeout(() => setPhase('name'), 2400));

    return () => timers.forEach(clearTimeout);
  }, [triggerBig]);

  // Auto-focus input when name phase begins
  useEffect(() => {
    if (phase === 'name') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(name.trim() || 'Penny');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)' }}
    >
      {/* Egg / Hatchling */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Egg — visible in appear, wobble, crack phases */}
        {(phase === 'appear' || phase === 'wobble' || phase === 'crack') && (
          <div className="relative">
            <span
              className={`text-8xl select-none block ${phase === 'wobble' ? 'animate-egg-wobble' : ''}`}
            >
              🥚
            </span>

            {/* SVG crack overlay — only in crack phase */}
            {phase === 'crack' && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Crack 1 */}
                <path
                  d="M48 10 L44 28 L50 34 L46 52"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                  style={{
                    strokeDasharray: 50,
                    '--crack-length': '50',
                    animation: 'crack-draw 0.4s ease-out 0s forwards',
                  } as React.CSSProperties}
                />
                {/* Crack 2 */}
                <path
                  d="M62 18 L58 30 L64 36"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                  style={{
                    strokeDasharray: 30,
                    '--crack-length': '30',
                    animation: 'crack-draw 0.3s ease-out 0.1s forwards',
                  } as React.CSSProperties}
                />
                {/* Crack 3 */}
                <path
                  d="M34 24 L38 38"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.6"
                  style={{
                    strokeDasharray: 20,
                    '--crack-length': '20',
                    animation: 'crack-draw 0.25s ease-out 0.2s forwards',
                  } as React.CSSProperties}
                />
              </svg>
            )}
          </div>
        )}

        {/* Hatchling — visible in hatch + name phases */}
        {(phase === 'hatch' || phase === 'name') && (
          <span className={`text-8xl select-none block ${phase === 'hatch' ? 'animate-hatch-pop' : ''}`}>
            🐣
          </span>
        )}
      </div>

      {/* Name card — slides up in name phase */}
      {phase === 'name' && (
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up mt-8 w-72 bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4"
        >
          <p className="text-white/70 text-sm text-center">What will you name me?</p>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Penny"
            maxLength={20}
            className="w-full bg-white/20 text-white placeholder-white/40 rounded-lg px-4 py-2 text-center text-lg font-medium outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="w-full bg-white text-indigo-700 font-bold rounded-full py-3 text-base hover:bg-white/90 active:scale-95 transition-all"
          >
            Let&apos;s go! →
          </button>
        </form>
      )}
    </div>
  );
}
