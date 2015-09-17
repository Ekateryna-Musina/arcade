// General game entity class that
// encapsulates common methods and properties for players and enemies.
var Entity = function(x, y, sprite) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

// Rendering entity
Entity.prototype.render = function(canvasContext) {
    canvasContext.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Getting entity position
Entity.prototype.getPosition = function() {
    return {
        "x": this.x,
        "y": this.y
    };
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
var Player = function(x, y) {
    Entity.call(this, x, y, "images/char-boy.png");
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
