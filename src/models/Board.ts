import { State } from './State'

export class Board {
    state: State
    yCells: number;
    xCells: number;
    cellWidth: number;
    cellHeight: number;

    constructor(xCells: number, yCells: number){
        this.xCells = xCells;
        this.yCells = yCells;
    }
}