import { useEffect, useRef } from "react";
import { playGame } from "../matchThree/playGame";



export function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    let gameConfig = {
    width: 450,
    height: 700,
    scene: playGame,
    backgroundColor: 0x222222,
    parent: gameRef.current,
  };
  const game = new Phaser.Game(gameConfig);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
}
