import Phaser from 'phaser';
import { AMMO_TYPES, CONFIG } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_plane');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(0.25); 
        this.setCollideWorldBounds(true);
        this.setImmovable(false);
        this.body.setAllowGravity(false);

        this.currentAmmo = AMMO_TYPES.STANDARD;
        this.lastFired = 0;
        this.maxHealth = CONFIG.PLAYER_HEALTH;
        this.health = this.maxHealth;
        this.isDead = false;
        
        this.speedTier = 0;
        this.powerTier = 0;
        this.hasShield = false;
        this.isImmune = false;
        
        // Add shield visual
        this.shieldSprite = scene.add.sprite(x, y, 'explosion'); 
        this.shieldSprite.setScale(0.8).setTint(0x00ffff).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    }

    update(time, cursors) {
        if (this.isDead) {
            this.shieldSprite.setAlpha(0);
            return;
        }

        const velocity = 500;
        this.setVelocity(0);

        if (cursors.left.isDown || cursors.A.isDown) {
            this.setVelocityX(-velocity);
        } else if (cursors.right.isDown || cursors.D.isDown) {
            this.setVelocityX(velocity);
        }

        if (cursors.up.isDown || cursors.W.isDown) {
            this.setVelocityY(-velocity);
        } else if (cursors.down.isDown || cursors.S.isDown) {
            this.setVelocityY(velocity);
        }

        // Immunity effect (flicker)
        if (this.isImmune) {
            this.setAlpha(Math.floor(time / 100) % 2 === 0 ? 0.2 : 0.8);
        } else {
            this.setAlpha(1);
        }

        // Keep shield centered
        this.shieldSprite.setPosition(this.x, this.y);
        this.shieldSprite.setAlpha(this.hasShield ? 0.4 : 0);
        if (this.hasShield) {
            this.shieldSprite.rotation += 0.05;
        }

        if (cursors.space.isDown && time > this.lastFired) {
            this.fire();
            // Firing rate increase means more shots per second.
            // 10% per level means: baseRate / (1 + level * 0.1)
            const fireRate = this.currentAmmo.fireRate / (1 + (this.speedTier * 0.1));
            this.lastFired = time + Math.max(50, fireRate);
        }
    }

    fire() {
        // Damage increases by 10% per level: baseDamage * (1 + level * 0.1)
        const damage = this.currentAmmo.damage * (1 + (this.powerTier * 0.1));
        const modifiedAmmo = { ...this.currentAmmo, damage: damage };

        this.scene.fireProjectile(this.x + 60, this.y, modifiedAmmo);
    }

    takeDamage(amount = 1) {
        if (this.isImmune || this.isDead) return;

        if (this.hasShield) {
            this.hasShield = false;
            this.scene.createExplosion(this.x, this.y); 
            this.scene.events.emit('updateShield', false);
            this.startImmunity(1000); // Brief immunity after shield break
            return;
        }

        this.health -= amount;
        this.scene.events.emit('updateHealth', this.health);
        
        if (this.health <= 0) {
            this.die();
        } else {
            this.startImmunity(2000); // 2s immunity on damage
        }
    }

    startImmunity(duration) {
        this.isImmune = true;
        if (this.immunityTimer) this.immunityTimer.remove();
        this.immunityTimer = this.scene.time.delayedCall(duration, () => {
            this.isImmune = false;
            this.setAlpha(1);
        });
    }

    die() {
        this.isDead = true;
        this.setVelocity(0);
        this.setAlpha(0);
        this.isImmune = false;
        this.shieldSprite.setAlpha(0);
        this.scene.createExplosion(this.x, this.y);
    }

    setSpeedTier(tier) {
        this.speedTier = tier;
    }

    setPowerTier(tier) {
        this.powerTier = tier;
    }

    applyShield() {
        this.hasShield = true;
        this.scene.events.emit('updateShield', true);
    }
}