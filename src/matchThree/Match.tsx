type GameItem = {
  value: number;
  isEmpty: boolean;
  row: number;
  column: number;
  customData?: any;
};

type Match3Options = {
  rows: number;
  columns: number;
  frames: string[];
};

export class Match3 {
  rows: number;
  columns: number;
  frames: string[];
  items: number;
  gameArray: GameItem[][];
  selectedItem: { row: number; column: number } | false;

  constructor(obj: Match3Options) {
    this.rows = obj.rows;
    this.columns = obj.columns;
    this.frames = obj.frames;
    this.items = this.frames.length;

    this.gameArray = [];
    this.selectedItem = false;
  }

  generateField(): void {
    this.gameArray = [];
    this.selectedItem = false;
    for (let i = 0; i < this.rows; i++) {
      this.gameArray[i] = [];
      for (let j = 0; j < this.columns; j++) {
        do {
          let randomValue = Math.floor(Math.random() * this.items);
          let frameNameNumber = +this.frames[randomValue];
          this.gameArray[i][j] = {
            value: frameNameNumber,
            isEmpty: false,
            row: i,
            column: j,
          };
        } while (this.isPartOfMatch(i, j));
      }
    }
  }

  matchInBoard(): boolean {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.isPartOfMatch(i, j)) {
          return true;
        }
      }
    }
    return false;
  }

  isPartOfMatch(row: number, column: number): boolean {
    return (
      this.isPartOfHorizontalMatch(row, column) ||
      this.isPartOfVerticalMatch(row, column)
    );
  }

  isPartOfHorizontalMatch(row: number, column: number): boolean {
    return (
      (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
        this.valueAt(row, column) === this.valueAt(row, column - 2)) ||
      (this.valueAt(row, column) === this.valueAt(row, column + 1) &&
        this.valueAt(row, column) === this.valueAt(row, column + 2)) ||
      (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
        this.valueAt(row, column) === this.valueAt(row, column + 1))
    );
  }

  isPartOfVerticalMatch(row: number, column: number): boolean {
    return (
      (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
        this.valueAt(row, column) === this.valueAt(row - 2, column)) ||
      (this.valueAt(row, column) === this.valueAt(row + 1, column) &&
        this.valueAt(row, column) === this.valueAt(row + 2, column)) ||
      (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
        this.valueAt(row, column) === this.valueAt(row + 1, column))
    );
  }

  valueAt(row: number, column: number): number | false {
    if (!this.validPick(row, column)) {
      return false;
    }
    return this.gameArray[row][column].value;
  }

  validPick(row: number, column: number): boolean {
    return (
      row >= 0 &&
      row < this.rows &&
      column >= 0 &&
      column < this.columns &&
      this.gameArray[row] != undefined &&
      this.gameArray[row][column] != undefined
    );
  }

  getRows(): number {
    return this.rows;
  }

  getColumns(): number {
    return this.columns;
  }

  setCustomData(row: number, column: number, customData: any): void {
    this.gameArray[row][column].customData = customData;
  }

  customDataOf(row: number, column: number): any {
    return this.gameArray[row][column].customData;
  }

  getSelectedItem(): { row: number; column: number } | false {
    return this.selectedItem;
  }

  setSelectedItem(row: number, column: number): void {
    this.selectedItem = { row, column };
  }

  deleselectItem(): void {
    this.selectedItem = false;
  }

  areTheSame(row: number, column: number, row2: number, column2: number): boolean {
    return row === row2 && column === column2;
  }

  areNext(row: number, column: number, row2: number, column2: number): boolean {
    return Math.abs(row - row2) + Math.abs(column - column2) === 1;
  }

  swapItems(
    row: number,
    column: number,
    row2: number,
    column2: number
  ): Array<{ row: number; column: number; deltaRow: number; deltaColumn: number }> {
    const tempObject = { ...this.gameArray[row][column] };
    this.gameArray[row][column] = { ...this.gameArray[row2][column2] };
    this.gameArray[row2][column2] = tempObject;
    return [
      {
        row,
        column,
        deltaRow: row - row2,
        deltaColumn: column - column2,
      },
      {
        row: row2,
        column: column2,
        deltaRow: row2 - row,
        deltaColumn: column2 - column,
      },
    ];
  }

  getMatchList(): Array<{ row: number; column: number }> {
    const matches: Array<{ row: number; column: number }> = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.isPartOfMatch(i, j)) {
          matches.push({ row: i, column: j });
        }
      }
    }
    return matches;
  }

  removeMatches(): void {
    const matches = this.getMatchList();
    matches.forEach((item) => {
      this.setEmpty(item.row, item.column);
    });
  }

  setEmpty(row: number, column: number): void {
    this.gameArray[row][column].isEmpty = true;
  }

  isEmpty(row: number, column: number): boolean {
    return this.gameArray[row][column].isEmpty;
  }

  emptySpacesBelow(row: number, column: number): number {
    let result = 0;
    if (row !== this.getRows()) {
      for (let i = row + 1; i < this.getRows(); i++) {
        if (this.isEmpty(i, column)) {
          result++;
        }
      }
    }
    return result;
  }

  arrangeBoardAfterMatch(): Array<{ row: number; column: number; deltaRow: number; deltaColumn: number }> {
    const result: Array<{ row: number; column: number; deltaRow: number; deltaColumn: number }> = [];
    for (let i = this.getRows() - 2; i >= 0; i--) {
      for (let j = 0; j < this.getColumns(); j++) {
        const emptySpaces = this.emptySpacesBelow(i, j);
        if (!this.isEmpty(i, j) && emptySpaces > 0) {
          this.swapItems(i, j, i + emptySpaces, j);
          result.push({
            row: i + emptySpaces,
            column: j,
            deltaRow: emptySpaces,
            deltaColumn: 0,
          });
        }
      }
    }
    return result;
  }

  replenishBoard(): Array<{ row: number; column: number; deltaRow: number; deltaColumn: number }> {
    const result: Array<{ row: number; column: number; deltaRow: number; deltaColumn: number }> = [];
    for (let i = 0; i < this.getColumns(); i++) {
      if (this.isEmpty(0, i)) {
        const emptySpaces = this.emptySpacesBelow(0, i) + 1;
        for (let j = 0; j < emptySpaces; j++) {
          const randomValue = Math.floor(Math.random() * this.items);
          const frameNameNumber = +this.frames[randomValue];
          result.push({
            row: j,
            column: i,
            deltaRow: emptySpaces,
            deltaColumn: 0,
          });
          this.gameArray[j][i].value = frameNameNumber;
          this.gameArray[j][i].isEmpty = false;
        }
      }
    }
    return result;
  }
}


// type GameItem = {
//   value: number;
//   isEmpty: boolean;
//   row: number;
//   column: number;
//   customData?: any;
// };

// type Match3Options = {
//   rows: number;
//   columns: number;
//   frames: string[];
// };


// export class Match3 {

//   rows: number;
//   columns: number;
//   frames: string[];
//   items: number;
//   gameArray: GameItem[][];
//   selectedItem: { row: number; column: number } | false;

//   constructor(obj) {
//     this.rows = obj.rows;
//     this.columns = obj.columns;
//     this.frames = obj.frames;
//     this.items = this.frames.length;
//     this.gameArray = [];
//     this.selectedItem = false;
//   }

//   // generates the game field
//   generateField() {
//     this.gameArray = [];
//     this.selectedItem = false;
//     for (let i = 0; i < this.rows; i++) {
//       this.gameArray[i] = [];
//       for (let j = 0; j < this.columns; j++) {
//         do {
//           // console.log("gameArray", this.gameArray)
//           let randomValue = Math.floor(Math.random() * this.items);
//           let frameNameNumber = +this.frames[randomValue];
//           this.gameArray[i][j] = {
//             value: frameNameNumber,
//             isEmpty: false,
//             row: i,
//             column: j,
//           };
//         } while (this.isPartOfMatch(i, j));
//       }
//     }
//   }

//   // returns true if there is a match in the board
//   matchInBoard() {
//     for (let i = 0; i < this.rows; i++) {
//       for (let j = 0; j < this.columns; j++) {
//         if (this.isPartOfMatch(i, j)) {
//           return true;
//         }
//       }
//     }
//     return false;
//   }

//   // returns true if the item at (row, column) is part of a match
//   isPartOfMatch(row, column) {
//     return (
//       this.isPartOfHorizontalMatch(row, column) ||
//       this.isPartOfVerticalMatch(row, column)
//     );
//   }

//   // returns true if the item at (row, column) is part of an horizontal match
//   isPartOfHorizontalMatch(row, column) {
//     return (
//       (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
//         this.valueAt(row, column) === this.valueAt(row, column - 2)) ||
//       (this.valueAt(row, column) === this.valueAt(row, column + 1) &&
//         this.valueAt(row, column) === this.valueAt(row, column + 2)) ||
//       (this.valueAt(row, column) === this.valueAt(row, column - 1) &&
//         this.valueAt(row, column) === this.valueAt(row, column + 1))
//     );
//   }

//   // returns true if the item at (row, column) is part of an horizontal match
//   isPartOfVerticalMatch(row, column) {
//     return (
//       (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
//         this.valueAt(row, column) === this.valueAt(row - 2, column)) ||
//       (this.valueAt(row, column) === this.valueAt(row + 1, column) &&
//         this.valueAt(row, column) === this.valueAt(row + 2, column)) ||
//       (this.valueAt(row, column) === this.valueAt(row - 1, column) &&
//         this.valueAt(row, column) === this.valueAt(row + 1, column))
//     );
//   }

//   // returns the value of the item at (row, column), or false if it's not a valid pick
//   valueAt(row, column) {
//     if (!this.validPick(row, column)) {
//       return false;
//     }
//     return this.gameArray[row][column].value;
//   }

//   // returns true if the item at (row, column) is a valid pick
//   validPick(row, column) {
//     return (
//       row >= 0 &&
//       row < this.rows &&
//       column >= 0 &&
//       column < this.columns &&
//       this.gameArray[row] != undefined &&
//       this.gameArray[row][column] != undefined
//     );
//   }

//   // returns the number of board rows
//   getRows() {
//     return this.rows;
//   }

//   // returns the number of board columns
//   getColumns() {
//     return this.columns;
//   }

//   // sets a custom data on the item at (row, column)
//   setCustomData(row, column, customData) {
//     this.gameArray[row][column].customData = customData;
//   }

//   // returns the custom data of the item at (row, column)
//   customDataOf(row, column) {
//     return this.gameArray[row][column].customData;
//   }

//   // returns the selected item
//   getSelectedItem() {
//     return this.selectedItem;
//   }

//   // set the selected item as a {row, column} object
//   setSelectedItem(row, column) {
//     this.selectedItem = {
//       row: row,
//       column: column,
//     };
//   }

//   // deleselects any item
//   deleselectItem() {
//     this.selectedItem = false;
//   }

//   // checks if the item at (row, column) is the same as the item at (row2, column2)
//   areTheSame(row, column, row2, column2) {
//     return row == row2 && column == column2;
//   }

//   // returns true if two items at (row, column) and (row2, column2) are next to each other horizontally or vertically
//   areNext(row, column, row2, column2) {
//     return Math.abs(row - row2) + Math.abs(column - column2) == 1;
//   }

//   // swap the items at (row, column) and (row2, column2) and returns an object with movement information
//   swapItems(row, column, row2, column2) {
//     let tempObject = Object.assign(this.gameArray[row][column]);
//     this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
//     this.gameArray[row2][column2] = Object.assign(tempObject);
//     return [
//       {
//         row: row,
//         column: column,
//         deltaRow: row - row2,
//         deltaColumn: column - column2,
//       },
//       {
//         row: row2,
//         column: column2,
//         deltaRow: row2 - row,
//         deltaColumn: column2 - column,
//       },
//     ];
//   }

//   // return the items part of a match in the board as an array of {row, column} object
//   getMatchList() {
//     let matches = [];
//     for (let i = 0; i < this.rows; i++) {
//       for (let j = 0; j < this.columns; j++) {
//         if (this.isPartOfMatch(i, j)) {
//           matches.push({
//             row: i,
//             column: j,
//           });
//         }
//       }
//     }
//     return matches;
//   }

//   // removes all items forming a match
//   removeMatches() {
//     let matches = this.getMatchList();
//     matches.forEach(
//       function (item) {
//         this.setEmpty(item.row, item.column);
//       }.bind(this)
//     );
//   }

//   // set the item at (row, column) as empty
//   setEmpty(row, column) {
//     this.gameArray[row][column].isEmpty = true;
//   }

//   // returns true if the item at (row, column) is empty
//   isEmpty(row, column) {
//     return this.gameArray[row][column].isEmpty;
//   }

//   // returns the amount of empty spaces below the item at (row, column)
//   emptySpacesBelow(row, column) {
//     let result = 0;
//     if (row != this.getRows()) {
//       for (let i = row + 1; i < this.getRows(); i++) {
//         if (this.isEmpty(i, column)) {
//           result++;
//         }
//       }
//     }
//     return result;
//   }

//   // arranges the board after a match, making items fall down. Returns an object with movement information
//   arrangeBoardAfterMatch() {
//     let result = [];
//     for (let i = this.getRows() - 2; i >= 0; i--) {
//       for (let j = 0; j < this.getColumns(); j++) {
//         let emptySpaces = this.emptySpacesBelow(i, j);
//         if (!this.isEmpty(i, j) && emptySpaces > 0) {
//           this.swapItems(i, j, i + emptySpaces, j);
//           result.push({
//             row: i + emptySpaces,
//             column: j,
//             deltaRow: emptySpaces,
//             deltaColumn: 0,
//           });
//         }
//       }
//     }
//     return result;
//   }

//   // replenished the board and returns an object with movement information
//   replenishBoard() {
//     let result = [];
//     for (let i = 0; i < this.getColumns(); i++) {
//       if (this.isEmpty(0, i)) {
//         let emptySpaces = this.emptySpacesBelow(0, i) + 1;
//         for (let j = 0; j < emptySpaces; j++) {
//           let randomValue = Math.floor(Math.random() * this.items);
//           let frameNameNumber = +this.frames[randomValue];
//           result.push({
//             row: j,
//             column: i,
//             deltaRow: emptySpaces,
//             deltaColumn: 0,
//           });
//           this.gameArray[j][i].value = frameNameNumber;
//           this.gameArray[j][i].isEmpty = false;
//         }
//       }
//     }
//     return result;
//   }
// }
