import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.image(960, 540, 'sky_bg').setDisplaySize(1920, 1080);
        
        const title = this.add.text(960, 300, 'AERIAL STRIKE', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '84px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        const subTitle = this.add.text(960, 420, 'AMMO ECONOMY', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '42px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const startNormalButton = this.add.text(960, 600, 'NORMAL OPERATION', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('GameScene', { difficulty: 'normal' });
            this.scene.start('UIScene');
        });

        const startHardButton = this.add.text(960, 700, 'HARD OPERATION', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('GameScene', { difficulty: 'hard' });
            this.scene.start('UIScene');
        });

        const instructions = this.add.text(960, 850, 'WASD/Arrows: Fly  SPACE: Fire\nSurvive waves and upgrade ammo under pressure.', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        // Hover effects
        startNormalButton.on('pointerover', () => startNormalButton.setStyle({ fill: '#00ff00' }));
        startNormalButton.on('pointerout', () => startNormalButton.setStyle({ fill: '#ffffff' }));
        startHardButton.on('pointerover', () => startHardButton.setStyle({ fill: '#ff0000' }));
        startHardButton.on('pointerout', () => startHardButton.setStyle({ fill: '#ffffff' }));
    }
}
