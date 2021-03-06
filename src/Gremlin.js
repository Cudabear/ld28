Gremlin = function(gameInstance, key, x, y){
	this.gameInstance = gameInstance;
	this.name = 'gremlin';

	this.sprite = this.gameInstance.add.sprite(x, y, 'gremlin');

	this.sprite.animations.add('walk', [0, 1], 5);
	this.sprite.body.gravity.y = gravity;

	//gremlins want the key!
	this.key = key;

	this.sprite.animations.play('walk', 3, true);
	this.sprite.anchor.setTo(0.5, 0.5);

	//1 for right, -1 for left
	this.direction = 1;
	this.speed = 200;

	this.sprite.canJump = true;

	this.update = function(){		
		if(this.direction < 0){																				
			if(this.sprite.body.velocity.x > -this.speed){
				this.sprite.body.velocity.x -= 30;
			}
		}else{
			if(this.sprite.body.velocity.x < this.speed){
				this.sprite.body.velocity.x += 30;
			}
		}

		//gremlins go for the key!
		if(this.isKeyCloseEnough()){
			if(this.key.sprite.x < this.sprite.x){
				this.direction = -1;
				this.sprite.scale.x = -1;
			}else{
				this.direction = 1;
				this.sprite.scale.x = 1;
			}
		}

		//wander
		if(this.sprite.body.touching.right && this.sprite.body.touching.down){
			//sometimes we'll jump
			if(this.direction > 0 && this.sprite.canJump && Math.random() * 10 > 5){
				this.sprite.body.velocity.y = -800;
				this.canJump = false;
			}else{
				this.direction = -1;
				this.sprite.scale.x = -1;
				this.sprite.canJump = true;
				this.sprite.body.velocity.x = 0;
			}

		}else if(this.sprite.body.touching.left && this.sprite.body.touching.down){
			//sometimes we'll jump
			if(this.direction < 0 && this.sprite.canJump && Math.random() * 10 > 5){
				this.sprite.body.velocity.y = -800;
				this.canJump = false;
			}else{
				this.direction = 1;
				this.sprite.scale.x = 1;
				this.sprite.canJump = true;
				this.sprite.body.velocity.x = 0;
			}
		}
	}

	this.isKeyCloseEnough = function(){
		var distX = Math.abs(this.sprite.x - this.key.sprite.x);
		var distY = Math.abs(this.sprite.y - this.key.sprite.y);
		var dist = Math.sqrt(distX*distX + distY*distY);

		if(dist < 250){
			return true;
		}

		return false;
	}

	this.handleEdge = function(gremlin, tile){
		var row = tile.ty;
		var col = tile.tx;

		//if we have a big edge, turn around (unless the key is close enough!)
		if(this.sprite.body.touching.down){
			if(this.direction > 0){
				if(!this.isBlockSolid(level.map.getTile(col + 1, row - 1, 0)) && !this.isBlockSolid(level.map.getTile(col + 1, row, 0)) && !this.isBlockSolid(level.map.getTile(col + 1, row + 1, 0)) && !this.isBlockSolid(level.map.getTile(col + 1, row + 2, 0)) && !this.isKeyCloseEnough()){
					this.direction = -1;
					this.sprite.scale.x = -1;
				}
			}else{
				if(!this.isBlockSolid(level.map.getTile(col -1, row - 1, 0)) && !this.isBlockSolid(level.map.getTile(col - 1, row, 0)) && !this.isBlockSolid(level.map.getTile(col - 1, row + 1, 0)) && !this.isBlockSolid(level.map.getTile(col - 1, row + 2, 0)) && !this.isKeyCloseEnough()){
					this.direction = 1;
					this.sprite.scale.x = 1;
				}
			}
		}
	}

	this.onOut = function(){
		this.sprite.kill();
	}

	this.isBlockSolid = function(blockId){
		if(blockId === 1 || blockId === 2 || blockId ===  3|| blockId === 4 ||blockId === 5){
			return true;
		}
	}

	this.sprite.events.onOutOfBounds.add(this.onOut, this);

}