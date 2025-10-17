'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function BasketballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 150, y: 350 });
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isShot, setIsShot] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const HOOP_X = 300;
  const HOOP_Y = 100;
  const HOOP_WIDTH = 80;
  const BALL_RADIUS = 15;
  const GRAVITY = 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCourt = () => {
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw court lines
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;

      // Free throw line
      ctx.beginPath();
      ctx.moveTo(0, 380);
      ctx.lineTo(canvas.width, 380);
      ctx.stroke();

      // Center line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
    };

    const drawHoop = () => {
      // Backboard
      ctx.fillStyle = '#fff';
      ctx.fillRect(HOOP_X + 20, HOOP_Y - 40, 5, 80);

      // Hoop rim
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(HOOP_X, HOOP_Y, HOOP_WIDTH / 2, 0, Math.PI, true);
      ctx.stroke();

      // Net
      ctx.strokeStyle = '#ff6b3588';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI - (i * Math.PI) / 7;
        const x = HOOP_X + Math.cos(angle) * (HOOP_WIDTH / 2);
        const y = HOOP_Y + Math.sin(angle) * (HOOP_WIDTH / 2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 30);
        ctx.stroke();
      }
    };

    const drawBall = () => {
      const gradient = ctx.createRadialGradient(
        ballPosition.x - 5,
        ballPosition.y - 5,
        0,
        ballPosition.x,
        ballPosition.y,
        BALL_RADIUS
      );
      gradient.addColorStop(0, '#ff8c42');
      gradient.addColorStop(1, '#ff6b35');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ballPosition.x, ballPosition.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Ball lines
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ballPosition.x, ballPosition.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ballPosition.x - BALL_RADIUS, ballPosition.y);
      ctx.lineTo(ballPosition.x + BALL_RADIUS, ballPosition.y);
      ctx.stroke();
    };

    const drawAimLine = () => {
      if (isDragging) {
        ctx.strokeStyle = '#ffffff66';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ballPosition.x, ballPosition.y);
        ctx.lineTo(dragStart.x, dragStart.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const render = () => {
      drawCourt();
      drawHoop();
      drawAimLine();
      drawBall();
    };

    render();
  }, [ballPosition, isDragging, dragStart]);

  useEffect(() => {
    if (!isShot) return;

    const updateBall = () => {
      setBallVelocity((prev) => ({ x: prev.x, y: prev.y + GRAVITY }));
      setBallPosition((prev) => ({
        x: prev.x + ballVelocity.x,
        y: prev.y + ballVelocity.y,
      }));

      // Check if scored
      const distanceToHoop = Math.sqrt(
        Math.pow(ballPosition.x - HOOP_X, 2) + Math.pow(ballPosition.y - HOOP_Y, 2)
      );

      if (
        distanceToHoop < HOOP_WIDTH / 2 &&
        ballPosition.y > HOOP_Y - 10 &&
        ballPosition.y < HOOP_Y + 10 &&
        ballVelocity.y > 0
      ) {
        setScore((s) => s + 1);
        resetBall();
        return;
      }

      // Reset if out of bounds
      if (ballPosition.y > 400 || ballPosition.x < 0 || ballPosition.x > 600) {
        resetBall();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(updateBall);
    };

    animationFrameRef.current = requestAnimationFrame(updateBall);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isShot, ballPosition, ballVelocity]);

  const resetBall = () => {
    setBallPosition({ x: 150, y: 350 });
    setBallVelocity({ x: 0, y: 0 });
    setIsShot(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isShot) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // Calculate velocity with better scaling for easier shots
    const velocityX = (ballPosition.x - dragStart.x) / 8;
    const velocityY = (ballPosition.y - dragStart.y) / 8;

    setBallVelocity({ x: velocityX, y: velocityY });
    setIsDragging(false);
    setIsShot(true);
    setAttempts((a) => a + 1);
  };

  const handleReset = () => {
    setScore(0);
    setAttempts(0);
    resetBall();
  };

  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-primary">{score}</div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-accent">{attempts}</div>
          <div className="text-sm text-muted-foreground">Attempts</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-foreground">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border-2 border-border rounded-lg cursor-pointer shadow-2xl"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
          {isDragging ? '🎯 Release to shoot!' : '🏀 Click and drag anywhere to aim and shoot!'}
        </div>
      </div>

      <Button
        onClick={handleReset}
        variant="outline"
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Game
      </Button>
    </div>
  );
}
