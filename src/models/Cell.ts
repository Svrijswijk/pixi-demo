import {Player} from './Player'
import {Graphics} from 'pixi.js'

export class Cell {
    player: Player;
    backLight: Graphics;
    rect: Graphics;
    location: { x: number, y: number };

    constructor(location: { x: number, y: number }, rect: Graphics, backLight: Graphics){
        this.location = location;
        this.rect = rect;
        this.backLight = backLight;
    }
}