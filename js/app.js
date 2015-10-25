/**
* @description Game entity. Encapsulates common methods and properties for players and enemies.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
* @param {string} sprite - Entity image
*/
var Entity = function(x, y, sprite) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

/**
* @description Represents an enemy.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
* @param {int} speed - Entity speed
*/
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

/**
* @description Updates the enemy position according to it's speed
* @param {int} newx
* @param {int} newy
*/
Enemy.prototype.update = function(dt) {
    this.x = this.x + this.speed*dt*50;
};

/**
* @description Represents a player.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
* @param {string} image - Player image
*/
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

/**
* @description Changes player position
* @param {int} newx
* @param {int} newy
*/
Player.prototype.move = function(newx, newy) {
    this.x = newx;
    this.y = newy;
};

/**
* @description Resets player to initial state
*/
Player.prototype.reset = function() {
    this.x = this.xInit;
    this.y = this.yInit;
    this.move(this.x, this.y);
};

/**
* @description Represents a key gem.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
*/
var Key = function(x, y){
    Entity.call(this, x, y, "images/Key.png");
}

Key.prototype = Object.create(Entity.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Key,
        writable: true
    }
});

/**
* @description Represents a rock.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
* @param {string} image - Player image
*/
var Rock = function(x, y){
    Entity.call(this, x, y, "images/Rock.png");
}

Rock.prototype = Object.create(Entity.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Rock,
        writable: true
    }
});

/**
* @description Represents a gem.
* @constructor
* @param {int} x - X position
* @param {int} y - Y position
* @param {int} image - Player image
* @param {int} score - Number of score player will get for this gem
*/
var Gem = function(x, y, image, score){
    Entity.call(this, x, y, image);
    this.score = score;
}

Gem.prototype = Object.create(Entity.prototype, {
    constructor: {
        configurable: true,
        enumerable: true,
        value: Gem,
        writable: true
    }
});
