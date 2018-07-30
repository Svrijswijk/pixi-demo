import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core'
import { Player } from '../../models/Player'
import { State } from '../../models/State'
import { Board } from '../../models/Board'
import * as PIXI from 'pixi.js'
import { Graphics } from 'pixi.js'
import { Direction } from '../enums/Direction';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit {
  @ViewChild('boardContainer') boardContainer;

  board: Board;
  // Object which contains the stage and graphics
  app = new PIXI.Application({
    width: 1024,         // default: 800
    height: 1024,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
  });

  constructor() { }

  ngOnInit() {
    // Setup board
    let xCells = 16;
    let yCells = 16;
    this.board = new Board(xCells, yCells);
    this.board.cellWidth = this.app.renderer.width / this.board.xCells;
    this.board.cellHeight = this.app.renderer.height / this.board.yCells;
    this.app.renderer.backgroundColor = 0x333333;

    // Create players
    let players: Player[] = [];
    players.push(new Player("playerOne", 0xFFFF00))
    players.push(new Player("playerTwo", 0xff0000))
    players.push(new Player("playerOne", 0x0000ff))
    players.push(new Player("playerOne", 0x00ff00))

    // generate multidimensional array for keeping track of the state in the demo
    let cells = [];
    for (let i = 0; i < xCells; i++) {
      let row = [];
      cells[i] = row;
      for (let j = 0; j < yCells; j++) {
        let x = this.board.cellWidth * i + 1;
        let y = this.board.cellWidth * j + 1;
        let width = this.board.cellWidth - 2;
        let height = this.board.cellHeight - 2;
        let color = 0x0d0d0d;
        row[j] = {
          backlight: {},
          // rect: this.drawRectangle(x, y, width, height, color)
        };
      }
    }
    let state = new State(cells, players)
    this.board.state = state;

    // Append view of the PIXI app to the DOM
    this.boardContainer.nativeElement.appendChild(this.app.view);

    // Generate positions and inital moves for players
    this.generatePostions(this.board);
    let playerMoves = this.generateFirstMoves(this.board);
    this.updateBoard(playerMoves);

    // call loop method every 0.125 seconds to simulate gameplay
    let self = this;
    var loop = setInterval(function () { self.loop(self, playerMoves); }, 125);

    PIXI.loader
      // .add('./assets/resources/sprites/gridPiece.json')
      .add('./assets/resources/sprites/snake.json')
      .add('./assets/resources/sprites/samus.png')
      .add('./assets/resources/sprites/ship.png')

      //uncomment for disco-snakes
      // .load(function () { return self.test() });
  }

  test() {
    // create an array of textures from an image path
    var frames = [];

    // frames.push(PIXI.Texture.fromFrame('samus.png'));

    for (var i = 0; i < 64; i++) {
      var val = i < 10 ? '0' + i : i;

      // magically works since the spritesheet was loaded with the pixi loader
      frames.push(PIXI.Texture.fromFrame('snake00' + val + '.png'));
    }

    let cells = [];
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        let explosion = new PIXI.extras.AnimatedSprite(frames);
        explosion.width = this.board.cellWidth;
        explosion.height = this.board.cellHeight;
        explosion.loop = false;
        explosion.anchor.set(0.5);
        explosion.animationSpeed = 0.4;
        explosion.x = i * this.board.cellWidth + this.board.cellWidth / 2;
        explosion.y = j * this.board.cellHeight + this.board.cellHeight / 2;
        this.app.stage.addChild(explosion);
        let random = Math.random();
        explosion.tint = random * 0xFFFFFF;
        explosion.rotation = this.calcRotate(random);
        explosion.loop = true;
        explosion.play();
        let self = this;
        explosion.onLoop = () => {
          let random = Math.random();
          explosion.tint = random * 0xFFFFFF;
          explosion.rotation = self.calcRotate(random)
        }
        // explosion.onComplete = () => {
        // explosion.destroy();
        // }
      }
    }
    let ship = PIXI.Sprite.fromImage('./assets/resources/sprites/ship.png');
    ship.width = this.board.cellHeight;
    ship.height = this.board.cellWidth;
    ship.x = 13 * this.board.cellWidth + this.board.cellWidth / 2;
    ship.y = 13 * this.board.cellHeight + this.board.cellHeight / 2;
    ship.anchor.set(0.5);
    this.app.stage.addChild(ship);
  }

  calcRotate(number) {
    let rotation;
    if (number < 0.25) {
      rotation = Math.PI * 2 * 0.25
    } else if (number < 0.50) {
      rotation = Math.PI * 2 * 0.5
    } else if (number < 0.75) {
      rotation = Math.PI * 2 * 0.75
    } else {
      rotation = 0;
    }
    return rotation
  }

  // Loop through turns for demo purposes
  loop(self, playerMoves) {
    self.updateBoard(playerMoves)
  }

  // Update the board, basically a turn
  updateBoard(playerMoves: Map<Player, Direction>) {
    this.calculatePositions(playerMoves);
    this.drawRecs();
  }

  // Draw a rectangle
  drawRecs() {
    this.board.state.players.forEach(player => {
      if (player.state != 0) {
        // Create a graphics object
        let x = this.board.cellWidth * player.location.x + 1;
        let y = this.board.cellHeight * player.location.y + 1;
        let width = this.board.cellWidth - 2;
        let height = this.board.cellHeight - 2;

        let graphic = this.drawRectangle(x, y, width, height, player.color)

        graphic.tint = Math.random() * 0xFFFFFF;
      }
    });
  }

  drawRectangle(x: number, y: number, width: number, height: number, color: number) {
    var graphic = new PIXI.Graphics();
    graphic.beginFill(color);
    graphic.drawRect(x, y, width, height);
    // graphic.tint = Math.random() * 0xFFFFFF;
    this.app.stage.addChild(graphic);
    return graphic;
  }

  // Quick method to generate starting postions
  generatePostions(board: Board) {
    board.state.players.forEach(player => {
      let x = Math.floor((Math.random() * board.xCells));
      let y = Math.floor((Math.random() * board.yCells));
      player.location = { "x": x, "y": y }
    })
    this.drawRecs();
  }

  // Calculate the next position for each player
  calculatePositions(moves: Map<Player, Direction>) {
    moves.forEach((direction: Direction, player: Player) => {
      if (player.state != 0) {
        this.board.state.cells[player.location.x][player.location.y].player = player;
        switch (direction) {
          case Direction.Up: {
            player.location.y > 0 ? player.location.y -= 1 : player.state = 0;
            break;
          }
          case Direction.Down: {
            player.location.y < this.board.yCells - 1 ? player.location.y += 1 : player.state = 0;
            break;
          }
          case Direction.Left: {
            player.location.x > 0 ? player.location.x -= 1 : player.state = 0;
            break;
          }
          case Direction.Right: {
            player.location.x < this.board.xCells - 1 ? player.location.x += 1 : player.state = 0;
            break;
          }
        }
        if (this.board.state.cells[player.location.x][player.location.y].player) {
          player.state = 0
          console.log("dead")
        }
      }
    });
  }

  // Method to decide which way a player goes when starting, goes towards the direction with comparitavely the most space
  generateFirstMoves(board: Board) {
    let moves = new Map<Player, Direction>()
    let direction: Direction;
    this.board.state.players.forEach(player => {
      if (Math.abs(board.xCells / 2 - player.location.x) > Math.abs(board.yCells / 2 - player.location.y)) {
        if (board.xCells / 2 < player.location.x) {
          direction = Direction.Left;
        } else {
          direction = Direction.Right;
        }
      } else {
        if (board.yCells / 2 < player.location.y) {
          direction = Direction.Up;
        } else {
          direction = Direction.Down;
        }
      }
      moves.set(player, direction)
    });
    return moves;
  }
}
