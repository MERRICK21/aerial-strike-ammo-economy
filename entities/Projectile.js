import Phaser from 'phaser';
import { AMMO_TYPES } from '../config.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, ammoType, isEnemy = false, isBoss = false) {
        const texture = isEnemy ? 'missile_fast' : (ammoType?.texture || 'missile_std');
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isEnemy = isEnemy;
        this.isBoss = isBoss;
        
        const scale = isEnemy ? AMMO_TYPES.ENEMY.scale : (ammoType?.scale || 0.25);
        this.setScale(isBoss ? scale * 0.8 : scale); // Boss missiles are now even smaller than standard enemy ones
        
        this.body.setAllowGravity(false);
        this.body.setAngularVelocity(0); // Ensure no rotation
        
        if (this.isEnemy) {
            this.damage = isBoss ? 2 : 1; 
            const speed = AMMO_TYPES.ENEMY.speed;
            this.setFlipX(true);
            this.setTint(isBoss ? 0xff0000 : 0xffaa00);
            this.setVelocity( -speed, 0 ); // Explicitly set Y velocity to 0
        } else {
            this.damage = ammoType.damage;
            this.setVelocity( ammoType.speed, 0 ); // Explicitly set Y velocity to 0
        }
        this.setRotation(0); // Force rotation to 0
    }

    update() {
        if (this.x > 2000 || this.x < -100) {
            this.destroy();
        }
    }

    onHit(target) {
        if (this.isEnemy) {
            target.takeDamage(this.damage);
        } else {
            target.takeDamage(this.damage);
        }
        this.destroy();
    }
}
