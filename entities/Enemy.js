import Phaser from 'phaser';
import { CONFIG, ENEMY_TYPES, SCORES } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, typeKey = 'STANDARD', stage = 1) {
        const type = ENEMY_TYPES[typeKey] || ENEMY_TYPES.STANDARD;
        super(scene, x, y, type.texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.typeKey = typeKey;
        this.isElite = type.isElite || false;
        this.isBoss = type.isBoss || false;
        this.setScale(type.scale);
        this.setTint(type.tint);
        this.maxHealth = type.health;
        this.stage = stage;
        this.fireRate = type.fireRate;
        this.scorePoints = SCORES[typeKey] || 1;
        
        if (this.isBoss) {
            this.maxHealth = type.health + (stage * 20); // Boss health scales with stage
            this.health = this.maxHealth;
            this.scrapReward = 300;
            this.fireTimer = 0;
            this.summonTimer = 0;
            this.laserTimer = 0;
            this.isLaserFiring = false;
            this.body.setImmovable(true); // Don't get pushed by collision

            // Health bar for boss
            this.healthBarBg = scene.add.graphics();
            this.healthBarFill = scene.add.graphics();
            this.updateHealthBar();
        } else if (this.isElite) {
            this.health = type.health;
            this.scrapReward = CONFIG.ELITE_SCRAP_REWARD;
            this.fireTimer = 0;
        } else if (typeKey === 'SCOUT') {
            this.health = type.health;
            this.scrapReward = CONFIG.SCOUT_SCRAP_REWARD;
        } else {
            this.health = type.health;
            this.scrapReward = CONFIG.SCRAP_PER_KILL;
        }

        this.setFlipX(false);
        this.body.setAllowGravity(false);
        
        const baseSpeed = Phaser.Math.Between(CONFIG.ENEMY_SPEED_MIN, CONFIG.ENEMY_SPEED_MAX);
        this.speed = baseSpeed * type.speedMult;
        
        // Random drift movement
        this.driftTimer = 0;
        this.driftY = 0;
    }

    updateHealthBar() {
        if (!this.healthBarBg || !this.active) return;
        const width = 600;
        const height = 20;
        const x = 960 - width / 2;
        const y = 50;

        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0x000000, 0.7);
        this.healthBarBg.fillRect(x - 5, y - 5, width + 10, height + 10);
        this.healthBarBg.lineStyle(2, 0xffffff, 1);
        this.healthBarBg.strokeRect(x - 5, y - 5, width + 10, height + 10);

        this.healthBarFill.clear();
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.healthBarFill.fillStyle(0xff0000, 1);
        this.healthBarFill.fillRect(x, y, width * healthPercent, height);
    }

    update(time, delta) {
        if (!this.active) return;

        if (this.isBoss) {
            this.updateBoss(time, delta);
        } else {
            this.setVelocityX(-this.speed);
            // Gentle drift
            if (time > this.driftTimer) {
                this.driftY = Phaser.Math.Between(-50, 50);
                this.driftTimer = time + Phaser.Math.Between(1000, 3000);
            }
            this.setVelocityY(this.driftY);

            // Shooting for enemies with fireRate
            if (this.fireRate && time > this.fireTimer && this.x < 1800) {
                this.scene.fireEnemyProjectile(this.x - 80, this.y);
                this.fireTimer = time + this.fireRate;
            }
        }

        if (this.x < -200) {
            this.destroy();
        }
    }

    updateBoss(time, delta) {
        this.updateHealthBar();
        // Boss moves to fixed position (1500) and stays there
        const targetX = 1500;
        if (this.x > targetX) {
            this.setVelocityX(-200);
        } else {
            this.setVelocityX(0);
            this.setX(targetX); // Lock it exactly
        }

        // Vertical movement only
        if (time > this.driftTimer) {
            this.driftY = Phaser.Math.Between(-150, 150);
            this.driftTimer = time + Phaser.Math.Between(1250, 2500); // 20% more frequent
        }
        this.setVelocityY(this.driftY);

        // Constrain boss to screen
        if (this.y < 100) this.setY(100);
        if (this.y > 980) this.setY(980);

        // Mechanics based on stage
        // Stage 5+: Rapid fire
        if (this.stage >= 5 && time > this.fireTimer) {
            const currentFireRate = Math.max(200, this.fireRate - (this.stage * 50));
            this.scene.fireEnemyProjectile(this.x - 100, this.y, true); // true for boss projectile
            this.fireTimer = time + currentFireRate;
        }

        // Summon regular enemies (Scouts and Standard)
        if (time > this.summonTimer) {
            const enemyType = Phaser.Math.RND.pick(['SCOUT', 'STANDARD']);
            this.scene.spawnEnemy(enemyType, this.x - 100, this.y + Phaser.Math.Between(-100, 100));
            this.summonTimer = time + 4000;
        }

        // Stage 10+: Laser
        if (this.stage >= 10 && time > this.laserTimer && !this.isLaserFiring) {
            this.fireLaser(time);
        }
    }

    fireLaser(time) {
        if (!this.scene) return;
        this.isLaserFiring = true;
        const laser = this.scene.add.graphics();
        
        this.scene.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 1000,
            onUpdate: (tween) => {
                if (!this.scene || !this.active) {
                    laser.destroy();
                    tween.stop();
                    return;
                }
                const val = tween.getValue();
                laser.clear();
                laser.lineStyle(20 * val, 0xff0000, 0.8 * val);
                laser.strokeLineShape(new Phaser.Geom.Line(this.x - 50, this.y, -100, this.y));
                
                // Laser collision - deduct 2 HP (one full bar)
                if (val > 0.8) {
                    const player = this.scene.player;
                    if (player && !player.isDead && Math.abs(player.y - this.y) < 40 && player.x < this.x) {
                        player.takeDamage(2);
                    }
                }
            },
            onComplete: () => {
                laser.destroy();
                if (this.active) {
                    this.isLaserFiring = false;
                    this.laserTimer = time + 5000;
                }
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.isBoss) this.updateHealthBar();

        if (this.health <= 0) {
            this.scene.addScrap(this.scrapReward);
            this.scene.addScore(this.scorePoints);
            this.scene.createExplosion(this.x, this.y);
            if (this.isBoss) {
                if (this.healthBarBg) this.healthBarBg.destroy();
                if (this.healthBarFill) this.healthBarFill.destroy();
                this.scene.events.emit('bossDefeated');
            }
            this.destroy();
        } else {
            const originalTint = ENEMY_TYPES[this.typeKey].tint;
            this.setTint(0xffffff);
            this.scene.time.delayedCall(50, () => {
                if (this.active) {
                    this.setTint(originalTint);
                }
            });
        }
    }
}