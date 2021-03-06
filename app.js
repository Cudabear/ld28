var WIDTH = 960;
var HEIGHT = 720;

var player;
var key;
var lanterns = [];
var level;
var inputHandler;
var background;
var gremlins = [];
var currentLevel = 1;
var glows;

var jumpfx;
var stepfx;
var drainfx;
var restartfx;
var gameoverfx;
var pickupfx;

var messageIndex = -1;
var displayedMessage = 0;


var text;
var textShouldFadeIn = false;
var textShouldFadeOut = false;
var timeTextDisplayed = -1;

//technical stuff
var gravity = 35;
var game;

window.onload = function(){
	game = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'actual-game', {preload: preload, create: create, update: update, render: render});
	splash = new Phaser.Game(WIDTH, HEIGHT, Phaser.CANVAS, 'splash', {preload: splashPreload, create: splashCreate, update: splashUpdate, render: splashRender});
}

function showGame(){
	splash.destroy();
	document.getElementById('splash').innerHTML = '';
	document.getElementById('splash').setAttribute("style","height:0px");

	//give player control
	inputHandler = new InputHandler(game, player);
}

var states = {
	current: 2,
	playing: 1,
	intro: 2,
	dead: 3,
	ending: 4,
	splash: 5
}

function preload(){
	//images and resources
	game.load.atlasJSONHash('guy', 'res/img/guy.png', 'res/img/walking_guy.json');
	game.load.image('key', 'res/img/key.png');
	game.load.image('light', 'res/img/light.png');
	game.load.image('lantern', 'res/img/lantern.png');
	game.load.atlasJSONHash('gremlin', 'res/img/gremlin.png', 'res/img/gremlin.json');
	game.load.image('background', 'res/img/background.png');
	
	//levels
	game.load.tilemap('level0', 'res/levels/sample.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level1', 'res/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level2', 'res/levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level3', 'res/levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level4', 'res/levels/level4.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tilemap('level5', 'res/levels/level5.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.tileset('tiles', 'res/img/tiles.png', 32, 32, -1, 1, 1);

	//aduio
	game.load.audio('jump', 'res/sfx/jump.wav');
	game.load.audio('step', 'res/sfx/step.wav');
	game.load.audio('drain', 'res/sfx/drain.wav');
	game.load.audio('gameover', 'res/sfx/gameover.wav');
	game.load.audio('restart', 'res/sfx/restart.wav');
	game.load.audio('pickup', 'res/sfx/pickup.wav');
	game.load.audio('dark', 'res/sfx/dark.mp3');
}

function create(){
	tileSetInit();
	LevelFactory.init();

	game.world.setBounds(-20000, -20000, 60000, 60000);
	game.stage.backgroundColor = '#333333';
	background = game.add.sprite(0, 0, 'background');
	background.fixedToCamera = true;

	glows = game.add.group();

	jumpfx = game.add.audio('jump');
	stepfx = game.add.audio('step');
	drainfx = game.add.audio('drain');
	restartfx = game.add.audio('restart');
	gameoverfx = game.add.audio('gameover');
	pickupfx = game.add.audio('pickup');
	game.add.audio('dark',1,true).play();


	

	repeatLevel();
}

function displayText(texts, x, y){
	if(x && y){
		text.x = x;
		text.y = y;
	}
	text.alpha = 0;

	text.setText(texts);
	textShouldFadeIn = true;
}

function update(){
	game.physics.collide(player.sprite, level.layer);
	
	if(player.carriedItem !== player.key){	
		game.physics.collide(player.key.sprite, level.layer, keyCollisionHandler, null, this);
	}

	for(var z = 0; z < lanterns.length; z++){	
		lanterns[z].update();
		if(player.carriedItem !== lanterns[z]){
			game.physics.collide(lanterns[z].sprite, level.layer);
		}
	}

	for(var g = 0; g < gremlins.length; g++){
		if(gremlins[g].sprite && level.layer){
			game.physics.collide(gremlins[g].sprite, level.layer, gremlins[g].handleEdge, null, gremlins[g]);
		}
		game.physics.collide(key.sprite, gremlins[g].sprite, gameoverCollisionHandler, null, this);

		for(var z = 0; z < lanterns.length; z++){

			if(Phaser.Rectangle.intersects(gremlins[g].sprite.body, lanterns[z].lightBubble.body)){
				collisionHandler(gremlins[g].sprite, lanterns[z].lightBubble);
			}
		}

		gremlins[g].update();
	}

	if(messageIndex + 1 < messages[currentLevel].length && messageIndex < displayedMessage && inputHandler){
		messageIndex++;
		displayText(messages[currentLevel][messageIndex], game.camera.x + 250, game.camera.y + 150);
	}

	//text stuff
	if(textShouldFadeIn && text.alpha <= 1){
		text.alpha += 0.015;

		if(text.alpha >= 1){
			textShouldFadeIn = false;
			text.alpha = 1;
			timeTextDisplayed = game.time.now + 900;
		}
	}else if(textShouldFadeOut){
		text.alpha -= 0.015;

		if(text.alpha <= 0){
			text.alpha = 0;
			textShouldFadeOut = false;
			displayedMessage++;
		}
	}

	if(timeTextDisplayed > 0 && game.time.now > timeTextDisplayed){
		textShouldFadeOut = true;
		timeTextDisplayed = -1;
	}

	if(inputHandler){
		inputHandler.handleInput();
	}
}

function render(){

}

//prevent them from jumping over the light
function collisionHandler(gremlin, lightBubble){
	gremlin.canJump = false;

	if(gremlin.x <= lightBubble.x + 192){
		gremlin.body.velocity.x -= 100;
	}else{
		gremlin.body.velocity.x += 100;
	}

	return true;
}

function getLevelDat(levelDat){
	player = levelDat [1];
	key = levelDat [2];
	level = levelDat[0];
	lanterns = levelDat[3];
	gremlins = levelDat[4];
}

function keyCollisionHandler(entity, tile){
	//if drain, pass through
	if(entity === key.sprite && tile.tile.index === 10){
		entity.y += 64 + entity.height;
		drainfx.play();
	}
}

function gameoverCollisionHandler(key, entity){
	if(states.current !== states.gameOver){
		key.kill();
		player.sprite.body.velocity.x = 0;
		gameOver();
	}
}

function repeatLevel(){
	if(states.current === states.playing){
		player.sprite.kill();
		for(var i = 0; i < gremlins.length; i++){
			gremlins[i].sprite.kill();
		}
		key.sprite.kill();
		
		for(var i = 0; i < lanterns.length; i++){
			lanterns[i].sprite.kill();
		}


		
	}

	if(level && level.layer){
		level.layer.kill();
	}

	player = null;
	key = null;
	lanterns = [];
	gremlins = [];
	level = null;
	glows.destroy();
	glows = game.add.group();

	displayedMessage = 0;
	messageIndex = -1;

	//currentLevel++;
	getLevelDat(LevelFactory.createLevel(game, currentLevel));
	if(inputHandler){
		inputHandler.handler = player;
	}
	states.current = states.playing;
	if(text){
		text.destroy();
	}
	text = game.add.text(1800, 600, '', { font: '36px Iceland', align: 'center', fill: '#FFFFFF'});
	text.alpha = 0;
}

function gameOver(){
	gameoverfx.play();
	states.current = states.gameOver;
	displayText('sorry, bub! (press r to retry)', game.camera.x + 50, game.camera.y + 50);

}

function win(){

}