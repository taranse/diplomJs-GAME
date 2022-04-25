/**
 * Created by Евгений on 19.06.2017.
 */
class Player extends Actor {
  constructor(pos = new Vector()) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
    this._type = 'player';
  }
}