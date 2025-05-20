import { useState } from "react";
import { PhaserGame } from "./components/PhaserGame";


export function App() {
  const [score, setScore] = useState(0);
  console.log("SXXXX", score)
  return (
    <div className="App">
      <h1>Phaser Game</h1>
       <PhaserGame onScoreUpdate={setScore} />
    </div>
  );
}

