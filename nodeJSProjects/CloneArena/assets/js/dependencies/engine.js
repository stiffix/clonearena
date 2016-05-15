/*

	Project:		CLONE ARENA
	author: 		Stefan Gerboc
	Description:	Engine js development + dynamics

*/

var CANVAS_ID = null;
var CANVAS_ELEMENT = getElementById(CANVAS_ID);
var CTX = CANVAS_ELEMENT.getContext('2d');

var _Settings = 	{ 
					Player : {
						MOVE : 10,
						Move_State : {
							IDLE : 0,
							LEFT : -1,
							RIGHT : 1
						},
						WIDTH : 40,
						HEIGHT : 80
					},

					Direction : {
						LEFT : -1,
						RIGHT : 1
					}
				};

function BoundingPoint (x,y) {
	this.x = x;
	this.y = y;
}

function Bullet(x, y, dir, dmg) {
	this.x = x;
	this.y = y;
	this.direction = dir;
	this.damage = dmg;
}

function Weapon(type, damage, img, fire_rate) {
	this.isReady = false;
	this.isActive = false;
	this.type = type;
	this.damage = damage;
	this.img = img;
	this.fire_rate = fire_rate;
	this.fire_cooldown = null;
}

Weapon.prototype.fire = function() {
	// Can't fire
	if ( !this.isReady || this.fire_cooldown ) { return false; }

	// Fire rate
	this.fire_cooldown = setTimeOut(function() {
		this.isReady = true;
	}, this.fire_rate);

	return true;
};

/*
Weapon.prototype.reload = function() {
	// Can't reload
	if (this.reloading || (this.magazine == this.magazine_size)) { return false; }

	this.isReady = false;
	this.reloading = setTimeOut(function() {
		// Successfuly execute full-reload
		this.magazine = this.magazine_size;
		this.isReady = true;
	}, this.reload_time);
	return true;
};
*/

Weapon.prototype.setActive = function(active_state) {
	// When not active
	if (!active_state) {
		clearTimeout(this.fire_cooldown);
		//clearTimeout(this.reloading);
	}

	// Set state
	this.isActive = active_state;
};

function Inventory (w1, head, body) {
	this.weapon_primary = w1;
	this.head = head;
	this.body = body;
}

// Player statistics + data
function Player(x, y, inventory) {
	this.x = x;
	this.y = y;
	this.direction = _Settings.Direction.RIGHT;
	this.inventory = inventory;
	this.weapons = [this.inventory.weapon_primary, this.inventory.weapon_secondary];
	this.selected_weapon = 0;
	this.bullets = [];
	this.move_state = _Settings.Player.Move_State.IDLE;

	// Init - weapon
	this.weapons[this.selected_weapon].setActive(true);
	// Init - dynamics [bounding box]
	this.boundingPoints = [new BoundingPoint(this.x - _Settings.Player.WIDTH / 2),new BoundingPoint(this.x + _Settings.Player.WIDTH / 2),new BoundingPoint(this.y - _Settings.Player.HEIGHT / 2), new BoundingPoint(this.x + _Settings.Player.HEIGHT / 2) ];
}

/*
Player.prototype.reloadWeapon = function() {
	this.weapons[this.selected_weapon].reload();
};

*/

Player.prototype.fireWeapon = function() {
	if (this.weapons[this.selected_weapon].fire()) {
		this.bullets = new Bullet(this.x, this.y, this.direction, this.weapons[this.selected_weapon].damage);
	}
};

Player.prototype.move = function(delta) {
	this.x += (_Settings.Player.MOVE)*this.move_state;
};

Player.prototype.setMoveState = function(move_state) {
	this.move_state = move_state;
	if (move_state != _Settings.Player.Move_State.IDLE) {
		this.direction = move_state;
	}
};

function Map (data, wMap, hMap) {
		this.obstacles = [];
		this.width = wMap;
		this.height = hMap;

		// Fetch Obstacles from data
		var temp_obstacles = data.split(_Settings.Define.OBSTACLE_CHARACTER_SEPARATOR);
		var obst;
		for (obst = 0; obst < temp_obstacles.length; obst++) {
			this.obstacles.push(new Obstacle(temp_obstacles[obst].split(_Settings.Define.OBSTACLE_DATA_CHARACTER_SEPARATOR)));
		}
}

function Obstacle (data) {
	this.type = data[0];
	this.x = data[1];
	this.y = data[2];
	this.width = data[3];
	this.height = data[4];
}

Obstacle.prototype.intersects = function(obj) {

	var pointIdx;
	for (pointIdx = 0; pointIdx <= obj.boundingPoints; pointIdx++) {
		if ((obj.boundingPoints[pointIdx].x >= (this.x - this.width / 2)) && (obj.boundingPoints[pointIdx].x <= (this.x + this.width / 2))) {
			if ((obj.boundingPoints[pointIdx].y >= (this.y - this.height / 2)) && (obj.boundingPoints[pointIdx].x <= (this.y + this.height / 2))) {
				return true;
			}
		}
	}

	return false;
};

function Game (map_representation, players) {
	this.isReady = false;
	this.map = map_representation;
	this.player = null;
	this.otherPlayers = getPlayers(players_data);
	this.camera = new Camera(CANVAS_ELEMENT.width, CANVAS_ELEMENT.height);
}

function Camera (width, height, cameraOverflow_settings) {
	this.cameraOverflow = cameraOverflow_settings;		// if canvas is bigger than map
	this.width = width;
	this.height = height;
	this.maxWidth = maxW;
	this.maxHeight = maxH;
	this.minWidth = 0;
	this.minHeight = 0;
	this.xcenter = null;
	this.ycenter = null;
	this.centerPlayer = null;
}

Camera.prototype.setCenter = function(player) {
	this.centerPlayer = player;
	this.xcenter = player.x;
	this.ycenter = player.y;

	// Move || Center Camera
	this.move();
};

Camera.prototype.move = function() {
	if (!this.cameraOverflow.x) {
		// X
		if ((this.width / 2 - this.centerPlayer.x) < this.minWidth) {
			// The most left possible
			this.xcenter = this.minWidth + this.width / 2;
		} else if ((this.width / 2 + this.centerPlayer.x) < this.maxWidth) {
			// The most right possible
			this.xcenter = this.maxWidth - this.width / 2;
		} else {
			// Middle -> PlayerCentered camera
			this.xcenter = this.centerPlayer.x;
		}
	}

	if (!this.cameraOverflow.y) {
		// Y
		if ((this.height / 2 - this.centerPlayer.y) < this.minHeight) {
			// The most left possible
			this.ycenter = this.minHeight + this.height / 2;
		} else if ((this.height / 2 + this.centerPlayer.y) < this.maxHeight) {
			// The most right possible
			this.ycenter = this.maxHeight - this.height / 2;
		} else {
			// Middle -> PlayerCentered camera
			this.ycenter = this.centerPlayer.y;
		}
	}
};
