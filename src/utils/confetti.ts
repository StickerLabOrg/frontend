// @ts-ignore: canvas-confetti has no type declarations
import confetti from "canvas-confetti";

export function shootConfetti() {
  confetti({
    particleCount: 160,
    spread: 90,
    startVelocity: 60,
    origin: { y: 0.6 },
    ticks: 200,
  });

  confetti({
    particleCount: 120,
    spread: 120,
    startVelocity: 40,
    origin: { x: 1, y: 0.8 },
    ticks: 180,
  });

  confetti({
    particleCount: 120,
    spread: 120,
    startVelocity: 40,
    origin: { x: 0, y: 0.8 },
    ticks: 180,
  });
}
