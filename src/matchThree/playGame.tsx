import Phaser from "phaser";
import { gameOptions } from "../constans";
import { Match3 } from "./Match";

interface SelectedGem {
  row: number;
  column: number;
}

export class playGame extends Phaser.Scene {
  private onScoreUpdate: (score: number) => void;
  match3!: Match3;
  frames: string[] = [];
  poolArray: Phaser.GameObjects.Sprite[] = [];
  canPick: boolean = true;
  dragging: boolean = false;
  selectedGem: SelectedGem | null = null;
  swappingGems: number = 0;
  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;

  constructor(onScoreUpdate: (score: number) => void) {
    super("PlayGame");
    this.onScoreUpdate = onScoreUpdate;
  }

  // constructor() {
  //   super("PlayGame");
  // }

  preload() {
    this.load.atlas("gems", "/assets/elem.png", "/assets/elem.json");
  }

  create() {
    this.frames = this.textures.get("gems").getFrameNames();
    this.scoreText = this.add.text(10, 30, "Score: 0", {
      font: "24px Arial",
      color: "#ffffff",
    });

    this.match3 = new Match3({
      rows: 8,
      columns: 8,
      frames: this.frames,
    });

    this.match3.generateField();
    this.drawField();

    this.input.on("pointerdown", this.gemSelect, this);
  }

  drawField() {
    this.poolArray.forEach((sprite) => sprite.destroy());
    this.poolArray = [];

    for (let i = 0; i < this.match3.getRows(); i++) {
      for (let j = 0; j < this.match3.getColumns(); j++) {
        const gemX =
          gameOptions.boardOffset.x +
          gameOptions.gemSize * j +
          gameOptions.gemSize / 2;
        const gemY =
          gameOptions.boardOffset.y +
          gameOptions.gemSize * i +
          gameOptions.gemSize / 2;

        let gemIndex = this.match3.valueAt(i, j);
        if (
          typeof gemIndex !== "number" ||
          gemIndex < 0 ||
          gemIndex >= this.frames.length
        ) {
          gemIndex = 0;
        }
        const frameName = this.frames[gemIndex];
        const gem = this.add.sprite(gemX, gemY, "gems", frameName);

        let frame = this.textures.getFrame("gems", frameName);
        if (frame) {
          let scaleX = gameOptions.gemSize / frame.width;
          let scaleY = gameOptions.gemSize / frame.height;
          gem.setScale(scaleX, scaleY);
          gem.setData("baseScaleX", scaleX);
          gem.setData("baseScaleY", scaleY);
        }

        this.match3.setCustomData(i, j, gem);
      }
    }
  }

  gemSelect(pointer: Phaser.Input.Pointer) {
    if (!this.canPick) return;

    this.dragging = true;

    const row = Math.floor(
      (pointer.y - gameOptions.boardOffset.y) / gameOptions.gemSize
    );
    const col = Math.floor(
      (pointer.x - gameOptions.boardOffset.x) / gameOptions.gemSize
    );

    if (this.match3.validPick(row, col)) {
      const selectedGem = this.match3.getSelectedItem() as SelectedGem | null;
      const currentGem = this.match3.customDataOf(
        row,
        col
      ) as Phaser.GameObjects.Sprite;
      const baseScaleX = currentGem.getData("baseScaleX") || 1;
      const baseScaleY = currentGem.getData("baseScaleY") || 1;

      if (!selectedGem) {
        currentGem.setScale(baseScaleX * 1.2, baseScaleY * 1.2).setDepth(1);
        this.match3.setSelectedItem(row, col);
      } else {
        const selectedSprite = this.match3.customDataOf(
          selectedGem.row,
          selectedGem.column
        ) as Phaser.GameObjects.Sprite;
        const selectedBaseX = selectedSprite.getData("baseScaleX") || 1;
        const selectedBaseY = selectedSprite.getData("baseScaleY") || 1;

        if (
          this.match3.areTheSame(row, col, selectedGem.row, selectedGem.column)
        ) {
          currentGem.setScale(baseScaleX, baseScaleY);
          this.match3.deleselectItem();
        } else if (
          this.match3.areNext(row, col, selectedGem.row, selectedGem.column)
        ) {
          selectedSprite.setScale(selectedBaseX, selectedBaseY);
          this.match3.deleselectItem();
          this.swapGems(row, col, selectedGem.row, selectedGem.column, true);
        } else {
          selectedSprite.setScale(selectedBaseX, selectedBaseY);
          currentGem.setScale(baseScaleX * 1.2, baseScaleY * 1.2);
          this.match3.setSelectedItem(row, col);
        }
      }
    }
  }

  swapGems(
    row: number,
    col: number,
    row2: number,
    col2: number,
    swapBack: boolean
  ) {
    const movements = this.match3.swapItems(row, col, row2, col2);
    this.swappingGems = 2;
    this.canPick = false;

    movements.forEach((movement) => {
      const sprite = this.match3.customDataOf(movement.row, movement.column);
      this.tweens.add({
        targets: sprite,
        x: "+=" + gameOptions.gemSize * movement.deltaColumn,
        y: "+=" + gameOptions.gemSize * movement.deltaRow,
        duration: gameOptions.swapSpeed,
        callbackScope: this,
        onComplete: () => {
          this.swappingGems--;
          if (this.swappingGems === 0) {
            if (!this.match3.matchInBoard()) {
              if (swapBack) {
                this.swapGems(row, col, row2, col2, false);
              } else {
                this.canPick = true;
              }
            } else {
              this.handleMatches();
            }
          }
        },
      });
    });
  }

  handleMatches() {
    const gemsToRemove = this.match3.getMatchList();
    let destroyed = gemsToRemove.length;

    this.score += destroyed * 10;

    if (this.scoreText) {
      this.scoreText.setText("Score: " + this.score);
      this.onScoreUpdate(this.score) //наружу данные о счёте
    }

    gemsToRemove.forEach((gem) => {
      const sprite = this.match3.customDataOf(gem.row, gem.column);
      this.poolArray.push(sprite);

      this.tweens.add({
        targets: sprite,
        alpha: 0,
        duration: gameOptions.destroySpeed,
        callbackScope: this,
        onComplete: () => {
          destroyed--;
          if (destroyed === 0) this.makeGemsFall();
        },
      });
    });
  }

  makeGemsFall() {
    let moved = 0;
    this.match3.removeMatches();
    const fallingMovements = this.match3.arrangeBoardAfterMatch();

    fallingMovements.forEach((movement) => {
      moved++;
      const sprite = this.match3.customDataOf(movement.row, movement.column);
      this.tweens.add({
        targets: sprite,
        y: "+=" + gameOptions.gemSize * movement.deltaRow,
        duration: gameOptions.fallSpeed * Math.abs(movement.deltaRow),
        callbackScope: this,
        onComplete: () => {
          moved--;
          if (moved === 0) this.endOfMove();
        },
      });
    });

    const replenishMovements = this.match3.replenishBoard();

    replenishMovements.forEach((movement) => {
      moved++;
      const sprite = this.poolArray.pop()!;
      sprite.alpha = 1;
      sprite.y =
        gameOptions.boardOffset.y +
        gameOptions.gemSize * (movement.row - movement.deltaRow + 1) -
        gameOptions.gemSize / 2;
      sprite.x =
        gameOptions.boardOffset.x +
        gameOptions.gemSize * movement.column +
        gameOptions.gemSize / 2;
      const idx = this.match3.valueAt(movement.row, movement.column);
      sprite.setFrame(this.frames[idx !== false ? idx : 0]);
      this.match3.setCustomData(movement.row, movement.column, sprite);

      this.tweens.add({
        targets: sprite,
        y:
          gameOptions.boardOffset.y +
          gameOptions.gemSize * movement.row +
          gameOptions.gemSize / 2,
        duration: gameOptions.fallSpeed * movement.deltaRow,
        callbackScope: this,
        onComplete: () => {
          moved--;
          if (moved === 0) this.endOfMove();
        },
      });
    });
  }

  endOfMove() {
    if (this.match3.matchInBoard()) {
      this.time.addEvent({
        delay: 250,
        callback: this.handleMatches,
        callbackScope: this,
      });
    } else {
      this.canPick = true;
    }
  }
}
