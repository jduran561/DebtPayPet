/**
 * Confetti Hook - Triggers celebration animations
 */

import { useCallback } from 'react';

// CSS-based confetti configuration
interface ConfettiConfig {
  particleCount: number;
  spread: number;
  colors: string[];
  duration: number;
}

const SMALL_CONFETTI: ConfettiConfig = {
  particleCount: 30,
  spread: 60,
  colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
  duration: 2000,
};

const BIG_CONFETTI: ConfettiConfig = {
  particleCount: 80,
  spread: 100,
  colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'],
  duration: 3000,
};

const GOLD_CONFETTI: ConfettiConfig = {
  particleCount: 100,
  spread: 120,
  colors: ['#FFD700', '#FFC107', '#FFB300', '#FF8F00', '#F57C00', '#FFFFFF'],
  duration: 4000,
};

const MASSIVE_CONFETTI: ConfettiConfig = {
  particleCount: 150,
  spread: 180,
  colors: ['#FFD700', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6', '#FFFFFF'],
  duration: 5000,
};

/**
 * Creates and animates a single confetti particle
 */
const createParticle = (
  container: HTMLElement,
  config: ConfettiConfig,
  originX: number,
  originY: number
) => {
  const particle = document.createElement('div');
  const color = config.colors[Math.floor(Math.random() * config.colors.length)];
  const size = Math.random() * 10 + 5;
  const shape = Math.random() > 0.5 ? 'circle' : 'square';

  // Random direction and velocity
  const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
  const velocity = Math.random() * 6 + 4;
  const vx = Math.sin(angle) * velocity;
  const vy = -Math.cos(angle) * velocity - Math.random() * 3;
  const rotationSpeed = (Math.random() - 0.5) * 720;

  particle.style.cssText = `
    position: fixed;
    width: ${size}px;
    height: ${size}px;
    background-color: ${color};
    border-radius: ${shape === 'circle' ? '50%' : '2px'};
    pointer-events: none;
    z-index: 9999;
    left: ${originX}px;
    top: ${originY}px;
    opacity: 1;
  `;

  container.appendChild(particle);

  let x = originX;
  let y = originY;
  let rotation = 0;
  let currentVy = vy;
  const gravity = 0.15;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > config.duration) {
      particle.remove();
      return;
    }

    x += vx;
    currentVy += gravity;
    y += currentVy;
    rotation += rotationSpeed / 60;

    const opacity = Math.max(0, 1 - elapsed / config.duration);

    particle.style.transform = `translate(${x - originX}px, ${y - originY}px) rotate(${rotation}deg)`;
    particle.style.opacity = String(opacity);

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

/**
 * Main confetti trigger function
 */
const triggerConfetti = (config: ConfettiConfig, originX?: number, originY?: number) => {
  // Create container if it doesn't exist
  let container = document.getElementById('confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);
  }

  // Default origin is center-top of screen
  const x = originX ?? window.innerWidth / 2;
  const y = originY ?? 0;

  // Create particles with slight delay between each for cascade effect
  for (let i = 0; i < config.particleCount; i++) {
    setTimeout(() => {
      createParticle(container!, config, x + (Math.random() - 0.5) * 100, y);
    }, i * 10);
  }

  // Clean up container after animation completes
  setTimeout(() => {
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, config.duration + 1000);
};

/**
 * Hook for triggering confetti celebrations
 */
export const useConfetti = () => {
  const triggerSmall = useCallback((originX?: number, originY?: number) => {
    triggerConfetti(SMALL_CONFETTI, originX, originY);
  }, []);

  const triggerBig = useCallback((originX?: number, originY?: number) => {
    triggerConfetti(BIG_CONFETTI, originX, originY);
  }, []);

  const triggerGold = useCallback((originX?: number, originY?: number) => {
    triggerConfetti(GOLD_CONFETTI, originX, originY);
  }, []);

  const triggerMassive = useCallback((_originX?: number, originY?: number) => {
    // Trigger from multiple points for massive celebration
    triggerConfetti(MASSIVE_CONFETTI, window.innerWidth * 0.25, originY);
    setTimeout(() => {
      triggerConfetti(MASSIVE_CONFETTI, window.innerWidth * 0.5, originY);
    }, 200);
    setTimeout(() => {
      triggerConfetti(MASSIVE_CONFETTI, window.innerWidth * 0.75, originY);
    }, 400);
  }, []);

  return {
    triggerSmall,
    triggerBig,
    triggerGold,
    triggerMassive,
  };
};

export default useConfetti;
