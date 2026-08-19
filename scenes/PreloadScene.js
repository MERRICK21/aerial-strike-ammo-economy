import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.load.image('sky_bg', 'https://rosebud.ai/assets/vibrant_blue_sky_seamless.webp?SzgE');
        this.load.image('clouds', 'https://rosebud.ai/assets/wispy_cloud_layer.webp?CEit');
        this.load.image('player_plane', 'https://rosebud.ai/assets/player_plane.webp?eAGT');
        this.load.image('enemy_plane_1', 'https://rosebud.ai/assets/enemy_plane_1.webp?z526');
        this.load.image('missile_std', 'https://rosebud.ai/assets/missile_std.webp?zfWb');
        this.load.image('missile_fast', 'https://rosebud.ai/assets/missile_fast.webp?krVO');
        this.load.image('missile_power', 'https://rosebud.ai/assets/missile_power.webp?MQl3');
        this.load.image('explosion', 'https://rosebud.ai/assets/explosion.webp?bcfg');
        this.load.image('heart_pixel', 'https://rosebud.ai/assets/heart_pixel.webp?91Y7');

        // Loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }
}
