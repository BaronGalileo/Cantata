import { useEffect, useRef } from "react";
import { playGame } from "../matchThree/playGame";



export function PhaserGame({ onScoreUpdate }: { onScoreUpdate: (score: number) => void }) {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    let gameConfig = {
    width: 450,
    height: 700,
    scene: new playGame(onScoreUpdate),
    // scene: playGame,
    backgroundColor: 0x222222,
    parent: gameRef.current,
  };
  const game = new Phaser.Game(gameConfig);
  console.log(game);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef}/>;
}
