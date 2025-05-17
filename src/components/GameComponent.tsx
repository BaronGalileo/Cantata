// import Phaser from "phaser";
// import { useEffect, useRef } from "react";

// export default function PhaserGame() {
//   const gameRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!gameRef.current) return;

//     const config: Phaser.Types.Core.GameConfig = {
//       type: Phaser.AUTO,
//       width: 800,
//       height: 600,
//       parent: gameRef.current, // указываем DOM-элемент
//       physics: {
//         default: "arcade",
//         arcade: {
//           gravity: { x: 0, y: 300 },
//           debug: false,
//         },
//       },
//       scene: {
//         preload,
//         create,
//         update,
//       },
//     };

//     var player;
//     var platforms;
//     var cursors;
//     var stars;
//     var score = 0;
//     var scoreText;
//     var bombs;

//     const game = new Phaser.Game(config);

//     function preload(this: Phaser.Scene) {
//       this.load.image("sky", "assets/sky.png");
//       this.load.image("ground", "assets/platform.png");
//       this.load.image("star", "assets/star.png");
//       this.load.image("bomb", "assets/bomb.png");
//       this.load.spritesheet("dude", "assets/dude.png", {
//         frameWidth: 32,
//         frameHeight: 48,
//       });
//     }

//     function create(this: Phaser.Scene) {
//       this.add.image(400, 300, "sky");
//       scoreText = this.add.text(16, 16, "score: 0", {
//         fontSize: "32px",
//         fill: "#000",
//       });

//       platforms = this.physics.add.staticGroup();

//       platforms.create(400, 568, "ground").setScale(2).refreshBody();

//       platforms.create(600, 400, "ground");
//       platforms.create(50, 250, "ground");
//       platforms.create(750, 220, "ground");

//       player = this.physics.add.sprite(100, 450, "dude");

//       player.setBounce(0.2);
//       player.setCollideWorldBounds(true);
//       player.body.setGravityY(300);

//       this.anims.create({
//         key: "left",
//         frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
//         frameRate: 10,
//         repeat: -1,
//       });

//       this.anims.create({
//         key: "turn",
//         frames: [{ key: "dude", frame: 4 }],
//         frameRate: 20,
//       });

//       this.anims.create({
//         key: "right",
//         frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
//         frameRate: 10,
//         repeat: -1,
//       });
//       cursors = this.input.keyboard.createCursorKeys();
//       this.physics.add.collider(player, platforms);

//       stars = this.physics.add.group({
//         key: "star",
//         repeat: 11,
//         setXY: { x: 12, y: 0, stepX: 70 },
//       });

//       stars.children.iterate(function (child) {
//         child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
//       });
//       this.physics.add.collider(stars, platforms);

//       function collectStar(player, star) {
//         star.disableBody(true, true);

//         score += 10;
//         scoreText.setText("Score: " + score);

//         if (stars.countActive(true) === 0) {
//           stars.children.iterate(function (child) {
//             child.enableBody(true, child.x, 0, true, true);
//           });

//           var x =
//             player.x < 400
//               ? Phaser.Math.Between(400, 800)
//               : Phaser.Math.Between(0, 400);

//           var bomb = bombs.create(x, 16, "bomb");
//           bomb.setBounce(1);
//           bomb.setCollideWorldBounds(true);
//           bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
//         }
//       }

//       this.physics.add.overlap(player, stars, collectStar, null, this);

//       bombs = this.physics.add.group();
//       this.physics.add.collider(bombs, platforms);

//       this.physics.add.collider(player, bombs, hitBomb, null, this);
//       function hitBomb(player, bomb) {
//         this.physics.pause();

//         player.setTint(0xff0000);

//         player.anims.play("turn");
//         const gameOver = this.add.text(400, 300, "Game Over", {
//           fontSize: "32px",
//           fill: "#000",
//         });

//         gameOver = true;
//       }
//     }

//     function update(this: Phaser.Scene) {
//       if (cursors.left.isDown) {
//         player.setVelocityX(-160);

//         player.anims.play("left", true);
//       } else if (cursors.right.isDown) {
//         player.setVelocityX(160);

//         player.anims.play("right", true);
//       } else {
//         player.setVelocityX(0);

//         player.anims.play("turn");
//       }

//       if (cursors.up.isDown && player.body.touching.down) {
//         player.setVelocityY(-500);
//       }
//     }

//     // Очистка при размонтировании
//     return () => {
//       game.destroy(true);
//     };
//   }, []);

//   return <div ref={gameRef} />;
// }

// // import Phaser from 'phaser';
// // import React, { useEffect, useRef } from 'react';
// // import playGame from '../pharser/playGame';

// // const GameComponent: React.FC = () => {
// //   const gameRef = useRef<Phaser.Game | null>(null);
// //   const containerRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     if (!gameRef.current && containerRef.current) {
// //       const config: Phaser.Types.Core.GameConfig = {
// //         type: Phaser.AUTO,
// //         width: 900,
// //         height: 900,
// //         backgroundColor: '#222222',
// //         scene: [playGame],
// //         parent: containerRef.current,
// //       };
// //       gameRef.current = new Phaser.Game(config);
// //     }

// //     return () => {
// //       gameRef.current?.destroy(true);
// //       gameRef.current = null;
// //     };
// //   }, []);

// //   return <div ref={containerRef} />;
// // };

// // export default GameComponent;
