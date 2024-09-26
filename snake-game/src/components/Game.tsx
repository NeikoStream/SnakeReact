import React, { useEffect, useRef, useState } from 'react';
import './Game.css';

const CELL_SIZE = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const WIDTH = CANVAS_WIDTH / CELL_SIZE;
const HEIGHT = CANVAS_HEIGHT / CELL_SIZE;

type Direction = { x: number; y: number };
type Position = { x: number; y: number };

const getRandomPosition = (): Position => {
  return {
    x: Math.floor(Math.random() * WIDTH),
    y: Math.floor(Math.random() * HEIGHT),
  };
};

interface GameProps {
    playerId: number;
  }
  

  const Game: React.FC<GameProps> = ({ playerId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>(getRandomPosition());
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    const newDirection = { ...direction };
    if (e.key === 'ArrowUp' && direction.y !== 1) {
      newDirection.x = 0;
      newDirection.y = -1;
    } else if (e.key === 'ArrowDown' && direction.y !== -1) {
      newDirection.x = 0;
      newDirection.y = 1;
    } else if (e.key === 'ArrowLeft' && direction.x !== 1) {
      newDirection.x = -1;
      newDirection.y = 0;
    } else if (e.key === 'ArrowRight' && direction.x !== -1) {
      newDirection.x = 1;
      newDirection.y = 0;
    }
    setDirection(newDirection);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setSnake(prev => {
          const newSnake = [...prev];
          const head = { ...newSnake[0] };
          head.x += direction.x;
          head.y += direction.y;

          // Vérifier les collisions avec les murs
          if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) {
            setIsRunning(false);
            return newSnake;
          }

          // Vérifier les collisions avec le corps
          for (let part of newSnake) {
            if (part.x === head.x && part.y === head.y) {
              setIsRunning(false);
              return newSnake;
            }
          }

          newSnake.unshift(head);

          // Vérifier si la nourriture est mangée
          if (head.x === food.x && head.y === food.y) {
            setFood(getRandomPosition());
            setScore(prevScore => prevScore + 1);
          } else {
            newSnake.pop();
          }

          return newSnake;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [direction, isRunning, food]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Dessiner le serpent
      context.fillStyle = 'green';
      snake.forEach(part => {
        context.fillRect(part.x * CELL_SIZE, part.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      // Dessiner la nourriture
      context.fillStyle = 'red';
      context.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }, [snake, food]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const resetGame = async () => {
    if (!isRunning) {
      try {
        const response = await fetch('http://localhost:4000/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: playerId, mode: 'facile', score }),
        });
        const data = await response.json();
        if (!data.success) {
          alert('Erreur lors de l\'enregistrement du score.');
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
  
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomPosition());
    setIsRunning(true);
    setScore(0);
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      {!isRunning && (
        <div className="game-over">
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button onClick={resetGame}>Rejouer</button>
        </div>
      )}
      <div className="score">Score: {score}</div>
    </div>
  );
};

export default Game;
