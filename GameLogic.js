var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    //arcade is one of the included physics models
    //impact and matter.js are the other defaults
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//declare variables for game sprites
var player;
var stars;
var platforms;
var cursors;
//var bombs;
//add a scoring mechanism, start by declaring the text variables
var score = 0;
var scoreText;
var gameOverText;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    //note the spritesheet is a collection of image FRAMES for animation
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    //brings in asset drawing centered on the 800 by 600 viewport
    this.add.image(400, 300, 'sky');
    //brings the same asset but resetting drawing origin to top-left
    //this.add.image(0, 0, 'sky').setOrigin(0, 0);

    //this creates a Static Physics Group (as opposed to a DYNAMIC physics group)
    //STATIC bodies have POSITION and SIZE, DYNAMIC bodies can move around via forces
    //creating them as a GROUP allows children to have the same physics
    platforms = this.physics.add.staticGroup();

    //the ground image imported is a green rectangle 400x32
    //set scale doubles the size to 800x64
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    //all of these are the same object just arranged in different area
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 200, 'ground');


    //create our sprite with Physics Game Object Factory which creates a Dynamic body by default
    player = this.physics.add.sprite(100, 450, 'dude');
    //bounce value sets a slight rebound after jumping
    player.setBounce(0.2);
    //sprite collides with world boundaries, in this case our 800x600 viewport boundaries
    player.setCollideWorldBounds(true);
    //every sprite has a "body" property which we can enact physics upon
    player.body.setGravityY(300);//simulates gravity on the Y axis, higher value = higher gravity
    //create animations the sprite can 

    //add bombs to create enemies
    bombs = this.physics.add.group();
    //add collider between bombs and platforms
    this.physics.add.collider(bombs, platforms);
    //add collider between player and bombs
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //left uses spritesheet positions 0, 1, 2, and 3 for left animation
    //so a spritesheet is similar to an array, where each index contains the frame
    //image and can be called by it's position in the spritesheet
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        //sets rate to 10fps
        frameRate: 10,
        //-1 value tells animation to loop
        repeat: -1
    });

    //turn uses position 4 in the spritesheet, which faces the camera/player
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    //right uses frames 5, 6, 7 and 8
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })
    //this.add.image(400, 300, 'star');


    //CONTROLS - no need to add event listeners! Phaser has a built-in Keyboard manager
    cursors = this.input.keyboard.createCursorKeys();
    //createCursorKeys() populates the cursors variable with the four properties up, down, left, right
    //each of these directions is an instance of a key object

    //now we'll add a "stars" group with Dynamic physics
    stars = this.physics.add.group({
        key: "star",
        //repeating this 11 times yields 12 stars
        repeat: 11,
        //place at starting point then each child "steps" on the X axis
        //so first start is placed at 12, then 82, then 152, etc.
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    //randomize a bounce between .4 and .8
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    //to allow collisions between player and static objects we create a Collider object
    //very simply we use the player and platforms variables as our collider arguments
    //this collider is where the magic happens, it will test for collision between all group members
    this.physics.add.collider(player, platforms);
    //we need to add a collider for the stars now so they don't fall through the "ground"
    this.physics.add.collider(stars, platforms);
    //also check if a player overlaps with a star:
    this.physics.add.overlap(player, stars, collectStar, null, this);
    //add definition to the score text - 16x16 is position, default text is 0, define font size and fill but leave font default
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});
    this.gameOverText = this.add.text(400, 300, 'Game Over Dude!', { fontSize: '72px', fill: '#000'})
    this.gameOverText.setOrigin(.5);
    this.gameOverText.visible = false;
}


function update() {
    //poll the cursors object in the update function
    if (cursors.left.isDown) { //sprite will only move when key is down
        //set velocity to left with a negative X axis
        player.setVelocityX(-260);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        //set velocity to left with a positive X axis
        player.setVelocityX(260);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    //check that up key is depressed AND player is touching ground5
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }
}

//if player collider is activated call hitbomb function
//hitbomb stops the game (physics.pause()) and turns the player red (setTint)
function hitBomb(player, bomb){
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
        this.gameOverText.visible = true;
    }

//if player overlaps, collectStar is invoked
//function will disable the physics body of the object, removing it from display
function collectStar(player, star) {
    star.disableBody(true, true);
    //add score functionality to start collider, set score to current score + 10
    score += 10;
    scoreText.setText('Score: ' + score);

    //add a bomb spawn if all stars are collected
    if (stars.countActive(true) === 0){
        stars.children.iterate(function (child){
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);

        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

