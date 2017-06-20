/**
 * Created by Евгений on 16.06.2017.
 */
class Level {
    constructor(grid = [], actors = []) {
        this.grid        = grid;
        this.height      = grid.length;
        this.width       = grid.length > 0 ? Math.max(...grid.map(item => item.length)) : 0;
        this.status      = null;
        this.finishDelay = 1;
        this.actors      = actors;
        this.player      = actors.length > 0 ? actors[0] : null;
    }

    isFinished() {
        return this.status !== null && this.finishDelay < 0;
    }

    actorAt(actor) {
        if (!Actor.prototype.isPrototypeOf(actor)) {
            throw(new Error('Передан не верный аргумент!'));
        }
        if (this.actors.length && !(this.actors.length === 1) && actor.isIntersect(this.actors[1])) {
            return this.actors[1];
        }
    }

    obstacleAt(position, size) {
        if (!Vector.prototype.isPrototypeOf(position) || !Vector.prototype.isPrototypeOf(size)) {
            throw(new Error('Передан не верный аргумент!'));
        }
        let object = this.getVectorObject(position, size);
        if (object.left < 0 || object.right >= this.width || object.top >= this.height
            || !this.isCeil(object) || this.grid[object.left][object.bottom] === 'wall') {
            return 'wall';
        } else if (object.bottom < 0 || this.grid[object.left][object.bottom] === 'lava') {
            return 'lava';
        }
    }

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

    isCeil(object) {
        for (let value of Object.keys(object)) {
            if (Math.ceil(object[value]) !== object[value]) {
                return false;
            }
        }
        return true
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
        for (let index = 0; index < this.actors.length; index++) {
            if (this.actors[index].type === type) {
                return false;
            }
        }
        return true;
    }

    playerTouched(touch, actor = undefined) {
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