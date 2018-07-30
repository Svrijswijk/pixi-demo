export class Player {
    name: string;
    color: number;
    state: number;
    location: { x: number, y: number };

    constructor(name: string, color: number){
        this.name = name;
        this.color = color;
    }
}