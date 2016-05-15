// Canvas document element
var canvas = document.getElementById('maincanvas');
canvas.width = window.innerWidth;
canvas.height = 600;
canvas.style.margin = '0 auto';
canvas.style.display = 'block';

var canvas_context = canvas.getContext('2d');

var CONSTANTS_GAME = {
    FACING_LEFT : 1,
    FACING_RIGHT : 0,
    ATTACK_INTERVAL_SLEEP : 1000,
    MAX_SCREEN_RESOLUTION : {
        X : 1200,
        Y : 600
    },
    SPEED_DX : 3
};

var GRAPHICS_GAME_OFFSET = {
    BODY_OFFSET : {
        X : -5,
        Y : 0,
        POSITION_X : 0,
        POSITION_Y : 25
    },
    HELMET_OFFSET : {
        X : 10,
        Y : 0,
        POSITION_X : 0,
        POSITION_Y : 0
    },
    WEAPON_OFFSET : {
        X : 5,
        Y : 0,
        POSITION_X : 7,
        POSITION_Y : 20
    }
};

var KEYSET = {
    UP : 87,
    DOWN : 83,
    LEFT : 65,
    RIGHT : 68
};
// Load images
var ca_helmet = new Image();
ca_helmet.src = "src/helmet01.png";

var ca_body = new Image();
ca_body.src = "src/body.png";

var ca_weapon_lightsaber = new Image();
ca_weapon_lightsaber.src = "src/lightsaber_green.png";

var ca_background_ground = new Image();
ca_background_ground.src = "src/ground.gif";


function mapsprite(options) {
    'use strict';
    var that = {};
    
    that.context = options.context;
    that.imageBlocks = options.imageBlocks; // Array of Images
    
    return that;
}

function map(options) {
    'use strict';
    var that = {};
    that.obstacles = options.obstacles;
    that.width = options.width;
    that.height = options.height;
    
    
    that.render = function (camera) {
        
        // Render Obstacles
        var i;
        for (i = 0; i < that.obstacles.length; i += 1) {
            that.obstacles[i].render();
        }
    };
    return that;
}


function sprite(options) {
    'use strict';
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1,
        facing_offset = options.facing_offset || 0;
    
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    that.frameRow = options.frameRow || 0;
    that.x = undefined;
    that.y = undefined;
    that.isReady = false;
    that.gfx_x_offset = options.gfx_x_offset;
    that.gfx_y_offset = options.gfx_y_offset;
    that.gfx_x_offset_position = options.gfx_x_offset_positon;
    that.gfx_y_offset_position = options.gfx_y_offset_positon;
    
    that.setReady = function () {
        that.isReady = true;
    };
    
    that.updateFrameRow = function (frameRow) {
        //console.log(frameRow);
        that.frameRow = frameRow;
    };
    
    that.updatePosition = function (newx, newy) {
        that.x = newx;
        that.y = newy;
    };
    
    // Graphics
    
    that.update = function () {
        tickCount += 1;
        
        if (tickCount > ticksPerFrame) {
            tickCount = 0;
            
            frameIndex = (frameIndex + 1) % numberOfFrames;
        }
    };
    
    that.render = function () {
        if (!that.isReady) { return; }
        
        // Draw
        that.context.drawImage(
            that.image,
            frameIndex * that.width / numberOfFrames - that.gfx_x_offset + that.gfx_x_offset * that.frameRow,
            (that.frameRow * that.height) + that.gfx_y_offset,
            that.width / numberOfFrames,
            that.height,
            that.x + that.gfx_x_offset_position + that.frameRow * facing_offset,
            that.y + that.gfx_y_offset_position,
            that.width / numberOfFrames,
            that.height
        );
    };
    
    that.restoreFrameIndex = function () {
        frameIndex = 0;
    };
    
    return that;
}


function player(options) {
    'use strict';
    var that = {};
    
    // Stats
    that.globalX = options.globalX;
    that.globalY = options.globalY;
    that.x = options.x;
    that.y = options.y;
    that.name = options.name;
    that.health = options.health;
    that.facing = CONSTANTS_GAME.FACING_LEFT;
    that.canAttack = true;
    that.attackTimer = null;        // SetTimeOut object
    that.isBlocking = false;
    that.context = options.context;
    that.width = options.w;
    that.height = options.h;
    that.controls = {
        UP : false,
        DOWN : false,
        LEFT : false,
        RIGHT : false
    };
    
    // Rendering
    that.body = options.body;
    that.helmet = options.helmet;
    that.weapon = options.weapon;
    
    that.update = function () {
        that.updateMove();
        
        if (that.isMoving()) {
            that.body.update();
        }
        that.helmet.update();
        if (that.isAttacking()) {
            that.weapon.update();
        }
    };
    
    that.updatePosition = function (newx, newy) {
        that.body.updatePosition(newx, newy);
        that.helmet.updatePosition(newx, newy);
        that.weapon.updatePosition(newx, newy);
    };
    
    that.updateMove = function () {
        // Movement
        if (that.controls.LEFT) {
            that.moveLeft(CONSTANTS_GAME.SPEED_DX);
        }
        
        if (that.controls.RIGHT) {
            that.moveRight(CONSTANTS_GAME.SPEED_DX);
        }
    };
    
    that.initSprites = function () {
        that.body.setReady();
        that.helmet.setReady();
        that.weapon.setReady();
        
        // & Update
        that.updatePosition(that.x, that.y);
    };
    
    that.moveLeft = function (dx) {
        that.facing = CONSTANTS_GAME.FACING_LEFT;
        that.body.updateFrameRow(that.facing);
        that.weapon.updateFrameRow(that.facing);
        that.x -= dx;
        // Global X
        that.globalX -= dx;
        
        // Update sprites
        that.updatePosition(that.x, that.y);
    };
    
    that.moveRight = function (dx) {
        that.facing = CONSTANTS_GAME.FACING_RIGHT;
        that.body.updateFrameRow(that.facing);
        that.weapon.updateFrameRow(that.facing);
        that.x += dx;
        // Global X
        that.globalX += dx;
        
        // Update sprites
        that.updatePosition(that.x, that.y);
    };
    
    that.unblock = function () {
        that.isBlocking = false;
    };
    
    that.block = function () {
        var blockdata = {};
        blockdata.facing = that.facing;
        
        if (that.attackTimer !== null) {
            blockdata.blocked = false;
        } else {
            that.isBlocking = true;
            blockdata.blocked = true;
        }
        
        return blockdata;
    };
    
    that.attack = function () {
        var attackdata = {};
        attackdata.x = that.x;
        attackdata.y = that.y;
        attackdata.facing = that.facing;
        
        if (that.canAttack && !that.isBlocking) {
            that.canAttack = false;
            attackdata.attacked = true;
            that.attackTimer = setTimeout(function () {
                that.canAttack = true;
                clearTimeout(that.attackTimer);
                that.attackTimer = null;
            }, CONSTANTS_GAME.ATTACK_INTERVAL_SLEEP);
        } else {
            attackdata.attacked = false;
        }
        
        return attackdata;
    };
    
    that.render = function () {
        
        // Bounding box
        that.context.strokeStyle = '#FF0000';
        that.context.strokeRect(that.x, that.y, that.width, that.height);
        
        // Body render
        
        that.body.render();
        that.helmet.render();
        that.weapon.render();
    };
    
    that.getFrame = function (map, canvas) {
        var frame = {};
        
        // Frame X - coordinates
        if (that.globalX <= canvas.width / 2) {
            frame.startX = 0;
        } else {
            frame.startX = that.globalX - canvas.width / 2;
        }
        
        if (that.globalX >= (map.width - canvas.width / 2)) {
            frame.endX = map.width;
        } else {
            frame.endX = that.globalX + canvas.width / 2;
        }
        
        // Frame Y - coordinates
        
        frame.startY = 0;
        frame.endY = 600;
        
        //console.log(frame);
        
        return frame;
    };
    
    that.evaluateKey = function (assign, event) {
        switch (event.keyCode) {
        case KEYSET.UP:
            that.controls.UP = assign;
            break;
        case KEYSET.DOWN:
            that.controls.DOWN = assign;
            break;
        case KEYSET.LEFT:
            that.controls.LEFT = assign;
            break;
        case KEYSET.RIGHT:
            that.controls.RIGHT = assign;
            break;
        }
        
        if (!that.isMoving()) {
            that.body.restoreFrameIndex();
        }
    };
    
    that.isMoving = function () {
        return (that.controls.LEFT || that.controls.RIGHT);
    };
    
    that.isAttacking = function () {
        return that.attackTimer !== null;
    };
    
    // Callback!
    that.initSprites();
    
    return that;
}

function game(options) {
    'use strict';
    var that = {};
    that.isReady = false;
    that.players = options.players;
    that.camera = options.camera;
    that.canvas = options.canvas;
    that.context = options.context;
    that.map = options.map;
    
    that.gameLoop = function () {
        window.requestAnimationFrame(that.gameLoop);
        
        // Clean
        canvas_context.clearRect(0, 0, canvas.width, canvas.height);
        
        //Render Background
        that.renderBackground();
        
        // Render Game Objects
        that.update();
        that.render();
    };
    
    that.startGame = function () {
        that.isReady = true;
        that.gameLoop();
    };
    
    that.update = function () {
        var i;
        for (i = 0; i < that.players.length; i += 1) {
            that.players[i].update();
        }
    };
    
    that.render = function () {
        var i;
        for (i = 0; i < that.players.length; i += 1) {
            that.players[i].render();
        }
    };
    
    that.renderBackground = function () {
        var grd = that.context.createLinearGradient(0, 0, 0, canvas.height),
            frame,
            groundStartX,
            groundsCounter,
            i;
        grd.addColorStop(1, '#1b343b');
        grd.addColorStop(0, '#0f1e21');
        
        that.context.fillStyle = grd;
        that.context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ground (302 x 119) . gif
        frame = that.players[0].getFrame(that.map, that.canvas);
        
        if (frame.startX === 0) {
            groundStartX = frame.startX;
        } else {
            //groundStartX = (that.map / 302) / frame.startX;
            groundStartX = (frame.startX / 302);
        }
        
        // Maximum number of grounds
        groundsCounter = (that.canvas.width / 302) + 2;
        
        //console.log(groundStartX);
        
        // Render
        for (i = 0; i < groundsCounter; i += 1) {
            that.context.drawImage(
                ca_background_ground,
                -(groundStartX * 302) + i * 302,
                that.map.height - 80,
                302,
                119
            );
        }
        
        
    };
    
    that.resize = function () {
        that.camera.onResize(that.canvas.width, that.canvas.height);
    };
    
    that.evaluateKeyAssign = function (event) {
        that.players[0].evaluateKey(true, event);
    };
    
    that.evaluateKeyRelease = function (event) {
        that.players[0].evaluateKey(false, event);
    };
    
    return that;
}


var test__player = player({
    globalX: 100,
    globalY: canvas.height - 175,
    x: 100,
    y: canvas.height - 175,
    w: 50,
    h: 100,
    name: 'Testing Player',
    health: 100,
    context: canvas_context,
    body: sprite({
        context: canvas.getContext("2d"),
        width: 625,
        height: 78,
        image: ca_body,
        numberOfFrames : 10,
        ticksPerFrame : 4,
        gfx_x_offset : GRAPHICS_GAME_OFFSET.BODY_OFFSET.X,
        gfx_y_offset : GRAPHICS_GAME_OFFSET.BODY_OFFSET.Y,
        gfx_x_offset_positon : GRAPHICS_GAME_OFFSET.BODY_OFFSET.POSITION_X,
        gfx_y_offset_positon : GRAPHICS_GAME_OFFSET.BODY_OFFSET.POSITION_Y
    }),
    helmet: sprite({
        context: canvas.getContext("2d"),
        width: 40,
        height: 40,
        image: ca_helmet,
        gfx_x_offset : GRAPHICS_GAME_OFFSET.HELMET_OFFSET.X,
        gfx_y_offset : GRAPHICS_GAME_OFFSET.HELMET_OFFSET.Y,
        gfx_x_offset_positon : GRAPHICS_GAME_OFFSET.HELMET_OFFSET.POSITION_X,
        gfx_y_offset_positon : GRAPHICS_GAME_OFFSET.HELMET_OFFSET.POSITION_Y
    }),
    weapon: sprite({
        context: canvas_context,
        width: 387,
        height: 62,
        numberOfFrames : 5,
        ticksPerFrame : 5,
        image: ca_weapon_lightsaber,
        gfx_x_offset : GRAPHICS_GAME_OFFSET.WEAPON_OFFSET.X,
        gfx_y_offset : GRAPHICS_GAME_OFFSET.WEAPON_OFFSET.Y,
        gfx_x_offset_positon : GRAPHICS_GAME_OFFSET.WEAPON_OFFSET.POSITION_X,
        gfx_y_offset_positon : GRAPHICS_GAME_OFFSET.WEAPON_OFFSET.POSITION_Y,
        facing_offset : -35
    })
});

var GAME = game({
    players : [test__player],
    camera : null,
    map : map({
        obstacles : [],
        width : 1400,
        height : 600
    }),
    canvas : canvas,
    context : canvas_context
});




/// * INIT * ///
document.getElementsByTagName("BODY")[0].onresize = function () {
    'use strict';
    if (window.innerWidth <= CONSTANTS_GAME.MAX_SCREEN_RESOLUTION.X) {
        canvas.width = window.innerWidth;
    } else {
        canvas.width = CONSTANTS_GAME.MAX_SCREEN_RESOLUTION.X;
    }
    
    if (GAME) {
        GAME.resize();
    }
};

GAME.startGame();

document.addEventListener('keydown', function (event) {
    'use strict';
    GAME.evaluateKeyAssign(event);
});

document.addEventListener('keyup', function (event) {
    'use strict';
    GAME.evaluateKeyRelease(event);
});

/*
function gameLoop() {
    'use strict';

    window.requestAnimationFrame(gameLoop);
  
    
    test__player.update();
    test__player.render();
}
*/

//gameLoop();
