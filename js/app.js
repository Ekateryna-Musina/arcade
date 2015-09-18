// General game entity class that
// encapsulates common methods and properties for players and enemies.

var Entity = function(x, y, sprite) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};


// Enemy class, inherits Entity
var Enemy = function(x, y, speed) {
    Entity.call(this, x, y, "images/enemy-bug.png");
    this.speed = speed;
};

Enemy.prototype = Object.create(Entity.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Enemy,
        writable: true
    }
});

Enemy.prototype.update = function(dt) {
    this.x = this.x + this.speed;
};

//Player class
var Player = function(x, y, image) {
    Entity.call(this, x, y, image ? image : "images/char-boy.png");
    this.xInit = x;
    this.yInit = y;
};

Player.prototype = Object.create(Entity.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Player,
        writable: true
    }
});

Player.prototype.move = function(newx, newy) {
    this.x = newx;
    this.y = newy;
};

Player.prototype.reset = function() {
    this.x = this.xInit;
    this.y = this.yInit;
    this.move(this.x, this.y);
};
