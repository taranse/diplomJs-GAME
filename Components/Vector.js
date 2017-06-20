/**
 * Created by Евгений on 13.06.2017.
 */
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vectorObj) {
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
