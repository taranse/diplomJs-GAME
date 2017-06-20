/**
 * Created by Евгений on 14.06.2017.
 */
class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
        if (!this.isVectorProto(pos) || !this.isVectorProto(size) || !this.isVectorProto(speed)) {
            throw(new Error('Переданный аргумент неверного типа!'));
        } else {
            this.pos   = pos;
            this.size  = size;
            this.speed = speed;

            this._type   = 'actor';
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

    isVectorProto(object) {
        return Vector.prototype.isPrototypeOf(object);
    }

    isIntersect(actor) {
        if (actor && Actor.prototype.isPrototypeOf(actor)) {
            if (actor === this) {
                return false;
            }
            return !this.check(actor, this);

        } else {
            throw(new Error('Переданный аргумент неверного типа!'));
        }
    }

    check(firstActor, secondActor) {
        let first  = this.setSystemCoordinate(firstActor);
        let second = this.setSystemCoordinate(secondActor);
        if (first.left === second.left && first.left !== first.right) {
            return first.bottom >= second.top || first.top <= second.bottom;
        } else return first.left > second.left && first.left >= second.right || !(first.left > second.left) && !(first.right > second.left);
    }

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

