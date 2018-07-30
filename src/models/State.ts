import { Player } from './Player'
import { Cell } from './Cell'

export class State {
    cells: Cell[][];
    players: Player[];

    constructor(cells:Cell[][], players: Player[]) {
        this.cells = cells;
        this.players = players;
    }
}