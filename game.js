'use strict';
class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  plus(vectorObj) {
    // instanceof и обратить условие
    if (Vector.prototype.isPrototypeOf(vectorObj)) {
      let x = this.x + vectorObj.x,
          y = this.y + vectorObj.y;
      return new Vector(x, y);
    }
    throw(new Error('Переданный аргумент неверного типа!'));
  }
  
  times(factor = 1) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Actor {
  constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    // instanceof
    if (!this.isVectorProto(pos) || !this.isVectorProto(size) || !this.isVectorProto(speed)) {
      throw(new Error('Переданный аргумент неверного типа!'));
      // else не нужен, после исключение выполнения функции прекратится
    } else {
      this.pos   = pos;
      this.size  = size;
      this.speed = speed;
      
      // лучше перенести в type
      this._type   = 'actor';
      // лишние поля класса и они не будут меняться при изменении позиции
      this._left   = pos.x;
      this._right  = pos.x + size.x;
      this._top    = pos.y;
      this._bottom = pos.y + size.y;
    }
  }
  
  get type() {
    return this._type;
  }
  
  get left() {
    return this._left;
  }
  
  get right() {
    return this._right;
  }
  
  get top() {
    return this._top;
  }
  
  get bottom() {
    return this._bottom;
  }
  
  act() {}
  
  // лишний метод
  isVectorProto(object) {
    return Vector.prototype.isPrototypeOf(object);
  }
  
  isIntersect(actor) {
    // instanceof, обратить условие
    if (actor && Actor.prototype.isPrototypeOf(actor)) {
      if (actor === this) {
        return false;
      }
      // если обхект выше, ниже, левее, правее - false, иначе true (упростить)
      return !this.check(actor, this);
      
    } else {
      throw(new Error('Переданный аргумент неверного типа!'));
    }
  }
  
  // лишний метод
  check(firstActor, secondActor) {
    let first  = this.setSystemCoordinate(firstActor);
    let second = this.setSystemCoordinate(secondActor);
    if (first.left === second.left && first.left !== first.right) {
      return first.bottom >= second.top || first.top <= second.bottom;
    } else {
      return first.left > second.left && first.left >= second.right || !(first.left > second.left) && !(first.right > second.left);
    }
  }
  
  // совсем лишний метод
  setSystemCoordinate(actor) {
    let left, bottom;
    let newActor = {
      left: actor.left,
      right: actor.right,
      bottom: actor.bottom,
      top: actor.top,
    };
    if (newActor.left > newActor.right) {
      left           = newActor.left;
      newActor.left  = newActor.right;
      newActor.right = left;
    }
    if (newActor.bottom > newActor.top) {
      bottom          = newActor.bottom;
      newActor.bottom = newActor.top;
      newActor.top    = bottom;
    }
    return newActor;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    // не нужно так форматировать - любой автоматический форматтер сбросит это
    // тут нужно создать копию массива, чтобы нельзя было изменить поле снаружи
    this.grid        = grid;
    this.height      = grid.length;
    // 0 достаточно передать первым аргументов в max
    this.width       = grid.length > 0 ? Math.max(...grid.map(item => item.length)) : 0;
    this.status      = null;
    this.finishDelay = 1;
    // осздать копию
    this.actors      = actors;
    // игрок может быть не первым в массиве
    this.player      = actors.length > 0 ? actors[0] : null;
  }
  
  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  
  actorAt(actor) {
    if (!Actor.prototype.isPrototypeOf(actor)) {
      throw(new Error('Передан не верный аргумент!'));
    }
    // тут нужно провто найти в массиве элемент, который пересекается с переданным
    if (this.actors.length && !(this.actors.length === 1) && actor.isIntersect(this.actors[1])) {
      return this.actors[1];
    }
  }
  
  obstacleAt(position, size) {
    if (!Vector.prototype.isPrototypeOf(position) || !Vector.prototype.isPrototypeOf(size)) {
      throw(new Error('Передан не верный аргумент!'));
    }

    // тут должно быть 2 цикла по вертикали и горизонтали,
    // передираем ячейки поля и возвращаем значение, если ячейка не пуста
    let object = this.getVectorObject(position, size);
    if (object.left < 0 || object.right >= this.width || object.top >= this.height
      || !this.isCeil(object) || this.grid[object.left][object.bottom] === 'wall') {
        // эти значения должно браться из словаря
      return 'wall';
    } else if (object.bottom < 0 || this.grid[object.left][object.bottom] === 'lava') {
      return 'lava';
    }
  }
  
  // лишний метод
  getVectorObject(position, size) {
    let object = {};
    if (position.x + size.x > position.x) {
      object.left  = position.x;
      object.right = position.x + size.x;
    } else {
      object.right = position.x;
      object.left  = position.x + size.x;
    }
    if (position.y + size.y > position.y) {
      object.bottom = position.y;
      object.top    = position.y + size.y;
    } else {
      object.top    = position.y;
      object.bottom = position.y + size.y;
    }
    return object;
  }
  
  // лишний метод
  isCeil(object) {
    for (let value of Object.keys(object)) {
      if (Math.ceil(object[value]) !== object[value]) {
        return false;
      }
    }
    return true
  }
  
  // это нужно упростить
  removeActor(actor) {
    this.actors = this.actors.reduce((mass, item) => {
      if (item !== actor) {
        mass.push(item);
      }
      return mass;
    }, []);
  }
  
  noMoreActors(type) {
    // здесь лучше использовать some
    for (let index = 0; index < this.actors.length; index++) {
      if (this.actors[index].type === type) {
        return false;
      }
    }
    return true;
  }
  
  // перечитайте описание метода, в нём не хватает условия
  // actor = undefined - некорректное значение по-умолчанию, аргумент и так будет undefined
  playerTouched(touch, actor = undefined) {
    if (touch === 'lava' || touch === 'fireball') {
      // после этой строчки лучше написать return и убрать else if
      this.status = 'lost';
    } else if (touch === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  // некорректное значение по умолчанию
  constructor(actorObject = undefined) {
    this.actorObject = actorObject;
    // в словаре должны бить только препятствия
    this.symbols     = ['x', '!', '@', 'o', '=', '|', 'v'];
  }
  
  // некорректное значение по умолчанию
  actorFromSymbol(symbol = undefined) {
    // условие лишнее
    return symbol ? this.actorObject[symbol] : undefined;
  }
  
  obstacleFromSymbol(symbol = undefined) {
    // здесь должен быть объект, а не массив
    if (this.symbols.indexOf(symbol) === -1) {
      return undefined;
    } else if (symbol === 'x') {
      return 'wall';
    } else if (symbol === '!') {
      return 'lava'
    }
  }
  
  // лучше добавить значение по-умолчанию
  createGrid(plan) {
    // лишняя проверка
    if (!plan.length) {
      return [];
    }
    plan = plan.map(row => row.split('').map(item => this.obstacleFromSymbol(item)));
    return plan;
  }
  
  // это нужно переписать с учётом, что symbols должен быть массивом
  createActors(actors) {
    if (!actors.length || this.actorObject === undefined) {
      return [];
    }
    actors = actors
      .map((row, index) => this.filterSymbolsArray(row.split(''), index))
      .reduce((array, item) => array.concat(item), []);
    return actors;
  }
  
  // это лишний метод (перенести в createActors)
  filterSymbolsArray(arraySymbols, indexArray) {
    return arraySymbols
      .map((symbol, index) => {
        if (
          this.actorFromSymbol(symbol) !== undefined &&
          typeof this.actorFromSymbol(symbol) === 'function' &&
          new (this.actorFromSymbol(symbol))() instanceof Actor
        ) {
          return new (this.actorFromSymbol(symbol))(new Vector(index, indexArray))
        }
      })
      .filter(symbol => symbol !== undefined)
  }
  
  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}

class Fireball extends Actor {
  // лучше не опускать параметры new Vector - напишите корректные размеры
  constructor(pos = new Vector(), speed = new Vector()) {
    // вместо undefined подставить корректное значение
    super(pos, undefined, speed);
    // лишнее поле
    this._type = 'fireball';
  }
  
  getNextPosition(time = 1) {
    // pos должно быть вектром
    let pos = {};
    // форматировение
    pos.x   = this.pos.x + (this.speed.x * time);
    pos.y   = this.pos.y + (this.speed.y * time);
    return pos;
  }
  
  handleObstacle() {
    // мутируете вектор - не надо
    this.speed.x *= -1;
    this.speed.y *= -1;
  }
  
  act(time, level) {
    // это неправильно (см. выше)
    let pos = new Vector(this.getNextPosition(time).x, this.getNextPosition(time).y);
    if (!level.obstacleAt(pos, this.size)) {
      this.pos = this.getNextPosition(time)
    } else {
      this.handleObstacle();
    }
  }
}
class HorizontalFireball extends Fireball {
  // не опускайте параметры по-умолчанию
  constructor(pos = new Vector()) {
    super(pos, new Vector(2, 0));
  }
}
class VerticalFireball extends Fireball {
  // не опускайте параметры по-умолчанию
  constructor(pos = new Vector()) {
    super(pos, new Vector(0, 2));
  }
}
class FireRain extends Fireball {
  constructor(pos = new Vector()) {
    super(pos, new Vector(0, 3));
    this.oldPosition = this.pos;
  }
  
  handleObstacle() {
    this.pos = this.oldPosition;
  }
}

class Coin extends Actor {
  constructor(position = new Vector(), size = new Vector(0.6, 0.6)) {
    super(position.plus(new Vector(0.2, 0.1)), size);
    this._type       = 'coin';
    this.spring      = Math.random() * 2 * Math.PI;
    this.springSpeed = 8;
    this.springDist  = 0.07;
  }
  
  updateSpring(time = 1) {
    // скобки не нужны
    this.spring += (this.springSpeed * time);
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
  constructor(pos = new Vector()) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
    // перегружайте метод type() вместо использования _type иначе неочевидно что происходит
    this._type = 'player';
  }
}

// здесь должен быть запуск игры (см. описание задания)