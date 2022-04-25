/**
 * Created by Евгений on 17.06.2017.
 */
class LevelParser {
  constructor(actorObject = undefined) {
    this.actorObject = actorObject;
    this.symbols = ['x', '!', '@', 'o', '=', '|', 'v'];
  }

  actorFromSymbol(symbol = undefined) {
    return symbol ? this.actorObject[symbol] : undefined;
  }

  obstacleFromSymbol(symbol = undefined) {
    if (this.symbols.indexOf(symbol) === -1) {
      return undefined;
    } else if (symbol === 'x') {
      return 'wall';
    } else if (symbol === '!') {
      return 'lava'
    }
  }

  createGrid(plan) {
    if (!plan.length) {
      return [];
    }
    plan = plan.map(row => row.split('').map(item => this.obstacleFromSymbol(item)));
    return plan;
  }

  createActors(actors) {
    if (!actors.length || this.actorObject === undefined) {
      return [];
    }
    actors = actors
      .map((row, index) => this.filterSymbolsArray(row.split(''), index))
      .reduce((array, item) => array.concat(item), []);
    return actors;
  }

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