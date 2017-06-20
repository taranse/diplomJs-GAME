/**
 * Created by Евгений on 19.06.2017.
 */
class Coin extends Actor {
    constructor(position = new Vector(), size = new Vector(0.6, 0.6)) {
        super(position.plus(new Vector(0.2, 0.1)), size);
        this._type       = 'coin';
        this.spring      = Math.random() * 2 * Math.PI;
        this.springSpeed = 8;
        this.springDist  = 0.07;
    }

    updateSpring(time = 1) {
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