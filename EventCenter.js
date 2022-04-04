import Phaser from 'phaser';
var scoreText;
var gameOverText;


export default class UIScene extends Phaser.scene{
    constructor(){
        super('ui-scene')
    }
    create(){
        this.label = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});
        this.gameOverText = this.add.text(400, 300, 'Game Over Dude!', { fontSize: '72px', fill: '#000'})
        this.gameOverText.setOrigin(.5);
        this.gameOverText.visible = false;
    }
    updateScore(score){
        this.label.text = `score: ${score}`
    }
}

