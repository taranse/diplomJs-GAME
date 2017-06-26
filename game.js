'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vectorObj) {
    if (!(vectorObj instanceof Vector)) {
      throw(new Error('Переданный аргумент неверного типа!'));
    }
    let x = this.x + vectorObj.x,
        y = this.y + vectorObj.y;
    return new Vector(x, y);
  }

  times(factor = 1) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
      throw(new Error('Переданный аргумент неверного типа!'));
    }
    this.pos   = pos;
    this.size  = size;
    this.speed = speed;
    this._type = 'actor';
  }

  get type() {
    return this._type;
  }

  get left() {
    return this.pos.x;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get top() {
    return this.pos.y;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  act() {}

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw(new Error('Переданный аргумент неверного типа!'));
    }
    if (actor === this) {
      return false;
    }
    return !(this.left >= actor.right || this.right <= actor.left || this.bottom <= actor.top || this.top >= actor.bottom);
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid        = grid.slice();
    this.height      = grid.length;
    this.width       = Math.max(0, ...grid.map(item => item.length));
    this.status      = null;
    this.finishDelay = 1;
    this.actors      = actors.slice();
    this.player      = this.actors.filter(actor => actor.type === 'player')[0];
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!Actor.prototype.isPrototypeOf(actor)) {
      throw(new Error('Передан не верный аргумент!'));
    }

    for (let actorSelf of this.actors) {
      if (actor.isIntersect(actorSelf)) {
        return actorSelf;
      }
    }
  }

  obstacleAt(position, size) {
    if (!Vector.prototype.isPrototypeOf(position) || !Vector.prototype.isPrototypeOf(size)) {
      throw(new Error('Передан не верный аргумент!'));
    }
    let object = new Actor(position, size);

    if (object.left < 0 || object.right > this.width || object.bottom > this.height) {
      return 'wall';
    }
    if (object.top < 0) {
      return 'lava';
    }
    for (let row of this.grid) {
      for (let ceil of row) {
        if(this.grid[Math.ceil(object.top)][Math.ceil(object.left)]) {
          return this.grid[Math.ceil(object.top)][Math.ceil(object.left)]
        }
      }
    }
  }

  removeActor(actor) {
    this.actors = this.actors.reduce((mass, item) => {
      if (item !== actor) {
        mass.push(item);
      }
      return mass;
    }, []);
  }

  noMoreActors(type) {
    return !this.actors.some(actor => actor.type === type);
  }

  playerTouched(touch, actor) {
    if (this.status === null) {
      if (touch === 'lava' || touch === 'fireball') {
        this.status = 'lost';
      } else if (touch === 'coin') {
        this.removeActor(actor);
        if (this.noMoreActors('coin')) {
          this.status = 'won';
        }
      }
    }
  }
}

class LevelParser {
  constructor(actorObject = {}) {
    this.actorObject = actorObject;
    this.symbols     = {'x': 'wall', '!': 'lava'};
  }

  actorFromSymbol(symbol) {
    return this.actorObject[symbol];
  }

  obstacleFromSymbol(symbol) {
    return this.symbols[symbol];
  }

  createGrid(plan = []) {
    plan = plan.map(row => row.split('').map(item => this.obstacleFromSymbol(item)));
    return plan;
  }

  createActors(actors) {
    if (!actors.length || this.actorObject === undefined) {
      return [];
    }
    actors = actors
      .map((row, firstIndex) => row.split('').map((symbol, index) => {
        if (
          this.actorFromSymbol(symbol) !== undefined &&
          typeof this.actorFromSymbol(symbol) === 'function' &&
          new (this.actorFromSymbol(symbol))() instanceof Actor
        ) {
          return new (this.actorFromSymbol(symbol))(new Vector(index, firstIndex))
        }
      }).filter(symbol => symbol !== undefined))
      .reduce((array, item) => array.concat(item), []);
    return actors;
  }

  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
    this._type = 'fireball';
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + (this.speed.x * time), this.pos.y + (this.speed.y * time));
  }

  handleObstacle() {
    this.speed = new Vector(this.speed.x * -1, this.speed.y * -1)
  }

  act(time, level) {
    let pos = new Vector(this.getNextPosition(time).x, this.getNextPosition(time).y);
    if (!level.obstacleAt(pos, this.size)) {
      this.pos = this.getNextPosition(time);
    } else {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos = new Vector(0, 0)) {
    super(pos, new Vector(0, 3));
    this.oldPosition = this.pos;
  }

  handleObstacle() {
    this.pos = this.oldPosition;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(0, 0), size = new Vector(0.6, 0.6)) {
    super(position.plus(new Vector(0.2, 0.1)), size);
    this._type       = 'coin';
    this.spring      = Math.random() * 2 * Math.PI;
    this.springSpeed = 8;
    this.springDist  = 0.07;
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * 0.07);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return new Vector(this.pos.x, this.pos.y + this.getSpringVector().y);
  }

  act(time) {
    this.pos = this.getNextPosition(time)
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
    this._type = 'player';
  }
}

const actorDict = {
  '@': Player,
  'o': Coin,
  'v': FireRain,
  '|': VerticalFireball,
  '=': HorizontalFireball
};
const parser    = new LevelParser(actorDict);
loadLevels()
  .then(levels => {
    runGame(JSON.parse(levels), parser, DOMDisplay)
  });