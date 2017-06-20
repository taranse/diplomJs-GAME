/**
 * Created by Евгений on 19.06.2017.
 */
class Fireball extends Actor {
    constructor(pos = new Vector(), speed = new Vector()) {
        super(pos, undefined, speed);
        this._type = 'fireball';
    }

    getNextPosition(time = 1) {
        let pos = {};
        pos.x   = this.pos.x + (this.speed.x * time);
        pos.y   = this.pos.y + (this.speed.y * time);
        return pos;
    }

    handleObstacle() {
        this.speed.x *= -1;
        this.speed.y *= -1;
    }

    act(time, level) {
        let pos = new Vector(this.getNextPosition(time).x, this.getNextPosition(time).y);
        if (!level.obstacleAt(pos, this.size)) {
            this.pos = this.getNextPosition(time)
        } else {
            this.handleObstacle();
        }
    }
}
class HorizontalFireball extends Fireball {
    constructor(pos = new Vector()) {
        super(pos, new Vector(2, 0));
    }
}
class VerticalFireball extends Fireball {
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