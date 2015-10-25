/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document;
    var win = global.window;
    var canvas = doc.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var lastTime;

    var enemiesCount = 4;
    var allEnemies = [];
    var xBlockLength = 101;
    var yBlockLength = 83;
    var numRows = 6;
    var numCols = 5;
    var player;
    var aminationRequestID;

    var playerInitXPosition = 3;
    var playerInitYPosition = 6;
    var playerImage;

    var intersectionLevel = 20;
    var animationRequestID;
    var score = 0;
    var heart = 0;
    var keys = 0;
    var gems = [];

    var activeGem;

    var numKeys = 3;
    var numBlueGems = 5;
    var numGreenGems = 3;
    var numOrangeGems = 1;

    var numRocks = 3;
    var started = false;

    var rocks = [];
    var rocksCoordinates = [];

    canvas.width = numCols * xBlockLength;
    canvas.height = numRows * xBlockLength;

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;

    $("#canvas").append(canvas);

    // Generate enemies
    function generateEnemies() {
        allEnemies = [];
        for (var i = 0; i < enemiesCount; i++) {
            allEnemies.push(createEnemy());
        }
    }

    //Gets random coordinates for random entity position
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //Greate new entity object
    function createEnemy() {
        var x = getRandomInt(1, numCols + 1);
        var y = getRandomInt(2, 5);
        return new Enemy(getXCoordinate(x), getYCoordinate(y), getRandomInt(2, 15));
    }

    //Converts x coordinate to square number
    function getXCoordinate(value) {
        return Math.round((value - 1) * xBlockLength);
    }

    //Converts y coordinate to square number
    function getYCoordinate(value) {
        return Math.round((value - 1) * yBlockLength) - 10;
    }

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        animationRequestID = win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        generatePlayer();
        generateEnemies();
        generateRocks(player);
        generateGems();

        lastTime = Date.now();
        renderField();
        renderStatus();
    }

    //Renders the score number
    function renderStatus() {
        $("#score .badge").text(score);
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
            if (enemy.x > canvas.width) {
                enemy.x = 0;
                enemy.y = getYCoordinate(getRandomInt(2, 5)) - 10;
                enemy.speed = getRandomInt(2, 10);
            }
        });
    }

    // Checks collisions between player and enemies
    function checkCollisions() {
        var playerX = player.x;
        var playerY = player.y;
        allEnemies.forEach(function(enemy) {
            if (intersected(enemy, player)) {
                player.reset();
            }
        });
    }

    // Check intersection of player and enemies
    // for intersection accuracy I've introduced intersectionLevel value
    // so that to avoid inacurate player collision
    function intersected(enemy, player) {
        var enemyRect = {
            left: enemy.x,
            right: enemy.x + xBlockLength,
            top: enemy.y,
            bottom: enemy.y + yBlockLength
        };

        var playerRect = {
            left: getXCoordinate(player.x) + intersectionLevel,
            right: getXCoordinate(player.x) + xBlockLength - intersectionLevel,
            top: getYCoordinate(player.y) + intersectionLevel,
            bottom: getYCoordinate(player.y) + yBlockLength - intersectionLevel
        };

        return !(playerRect.left > enemyRect.right ||
            playerRect.right < enemyRect.left ||
            playerRect.top > enemyRect.bottom ||
            playerRect.bottom < enemyRect.top);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        renderField();
        renderEntities();
        renderStatus();
    }

    //Renders game field
    function renderField() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
            'images/water-block.png', // Top row is water
            'images/stone-block.png', // Row 1 of 3 of stone
            'images/stone-block.png', // Row 2 of 3 of stone
            'images/stone-block.png', // Row 3 of 3 of stone
            'images/grass-block.png', // Row 1 of 2 of grass
            'images/grass-block.png' // Row 2 of 2 of grass
        ];

        var row;
        var col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * xBlockLength, row * yBlockLength);
            }
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(renderEntity);

        renderEntity(player);

        rocks.forEach(renderEntity);

        renderEntity(activeGem);
    }

    /*Resets gems
      generate index of gem randomly and  replace active gem with the new one
    */
    function resetGem() {
        var index = getRandomInt(0, gems.length);
        activeGem = gems[index];
    }

    //Renders entities
    function renderEntity(entity) {     
        var isEnemy = entity instanceof Enemy;
        ctx.drawImage(Resources.get(entity.sprite), isEnemy ? entity.x : getXCoordinate(entity.x),
            isEnemy ? entity.y : getYCoordinate(entity.y));

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        player.reset();
        generateRocks(player);
        renderField();
    }


    //Gets random coordinates between minumum and maximum of x and y but excludes existing one
    function getRandomCoordinates(xMin, xMax, yMin, yMax, exclude) {
        var a = getRandomInt(xMin, xMax);
        var b = getRandomInt(yMin, yMax);

        if (exclude && exclude.indexOf(concatXY(a, b)) > -1) {
            return getRandomCoordinates(xMin, xMax, yMin, yMax, exclude);
        }

        return {
            "x": a,
            "y": b
        };
    }

    //Generates the rocks
    function generateRocks(player) {
        rocks = [];
        rocksCoordinates = [];
        var exclude = [];
        exclude.push(concatXY(player.x, player.y));

        for (var i = 0; i < numRocks; i++) {
            var randomCoordinates = getRandomCoordinates(1, numCols + 1, 5, 7, exclude);

            var rock = new Rock(randomCoordinates.x, randomCoordinates.y);
            rocks.push(rock);
            rocksCoordinates.push(concatXY(rock.x, rock.y));
            exclude.push(concatXY(randomCoordinates.x, randomCoordinates.y));
        }
    }

    //Generate gems randomly
    function generateGems() {
        var i = 0;
        var randomCoordinates;
        for (i = 0; i < numKeys; i++) {
            randomCoordinates = getRandomCoordinates(1, numCols + 1, 2, 5);
            var key = new Key(randomCoordinates.x, randomCoordinates.y);
            gems.push(key);
        }

        for (i = 0; i < numBlueGems; i++) {
            randomCoordinates = getRandomCoordinates(1, numCols + 1, 2, 5);
            gems.push(new Gem(randomCoordinates.x, randomCoordinates.y, "images/Gem Blue.png", 10));
        }

        for (i = 0; i < numGreenGems; i++) {
            randomCoordinates = getRandomCoordinates(1, numCols + 1, 2, 5);
            gems.push(new Gem(randomCoordinates.x, randomCoordinates.y, "images/Gem Green.png", 20));
        }

        for (i = 0; i < numOrangeGems; i++) {
            randomCoordinates = getRandomCoordinates(1, numCols + 1, 2, 5);
            gems.push(new Gem(randomCoordinates.x, randomCoordinates.y, "images/Gem Orange.png", 30));
        }

        resetGem();
    }

    //Concatenation x and y into string 
    function concatXY(x, y) {
        return x.toString().concat(",").concat(y.toString());
    }

    //Generate player
    function generatePlayer() {
        player = new Player(playerInitXPosition, playerInitYPosition, playerImage);

        document.addEventListener('keyup', function(e) {
            updatePlayerPosition(e.keyCode);
        });
    }

    //Updates player position wwhen key pressed
    function updatePlayerPosition(keyCode) {
        var playerXPos = player.x;
        var playerYPos = player.y;

        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        switch (keyCode) {
            case 37:
                if (playerXPos > 1) {
                    playerXPos = playerXPos - 1;
                }
                break;

            case 38:
                if (playerYPos > 1) {
                    playerYPos = playerYPos - 1;
                }
                break;

            case 39:
                if (playerXPos < numCols) {
                    playerXPos = playerXPos + 1;
                }
                break;

            case 40:
                if (playerYPos < numRows) {
                    playerYPos = playerYPos + 1;
                }
                break;
        }
        if (rocksCoordinates.indexOf(concatXY(playerXPos, playerYPos)) > -1) {
            return;
        }
        if (activeGem.x === playerXPos && activeGem.y === playerYPos) {
            if (activeGem instanceof Key) {
                keys++;
                if (keys === 3) {
                    hearts++;
                }
            } else {
                score += activeGem.score;
            }

            resetGem();
        }

        player.move(playerXPos, playerYPos);
        if (player.y == 1) {
            stopGame();
            score = 100;
            $("#score .badge").text(score);

            ctx.fillStyle = "white";
            ctx.font = "40px Georgia";
            ctx.fillText("Congratulations!!!", 120, 100);
        }
    }

    //Stop game 
    function stopGame() {
        started = false;
        $("#startGame").text("Start");
        win.cancelAnimationFrame(animationRequestID);
        reset();
    }
    
    //Start game
    function startGame() {
        started = true;
        main();
        $("#startGame").text("Stop");
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Star.png',
        'images/Rock.png'
    ]);
    Resources.onReady(init);


    $("#startGame").bind("click", function() {
        if (started) {
            stopGame();
            return;
        }
        startGame();
    });

    $("#score .badge").text(score);

    $("#carousel").carousel({
        interval: false
    });

    $('#myModal').on('hidden.bs.modal', function(e) {
        var image = $(".item.active img")[0];
        if (image) {
            player.sprite = $(image).attr("src");
        }
    });

})(this);
