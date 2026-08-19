import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Projectile from '../entities/Projectile.js';
import { CONFIG } from '../config.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.difficulty = data.difficulty || 'normal';
    }

    create() {
        this.scrap = CONFIG.INITIAL_SCRAP;
        this.score = 0;
        this.nextSpawn = 0;
        this.spawnInterval = CONFIG.SPAWN_INTERVAL;
        if (this.difficulty === 'hard') {
            this.spawnInterval *= 0.7; // 30% faster initial spawns
        }
        this.isPaused = false;
        this.shopVisitCount = 0;
        this.currentStage = 1;
        this.stageTimeLeft = CONFIG.SHOP_INTERVAL;
        this.isBossActive = false;
        this.isStageEnding = false;
        this.reviveCount = 0;

        // Background layers
        this.sky = this.add.tileSprite(960, 540, 1920, 1080, 'sky_bg');
        this.sky.setTileScale(1.5, 1.5); 
        
        // Groups
        this.enemies = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group({ runChildUpdate: true });
        this.enemyProjectiles = this.add.group({ runChildUpdate: true });
        this.explosions = this.add.group();

        // Player
        this.player = new Player(this, 200, 540);

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Collisions
        this.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.overlap(this.enemyProjectiles, this.player, this.handleEnemyProjectilePlayerCollision, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);

        // Event Listeners
        this.events.on('shopOpened', () => {
            this.shopVisitCount++;
            // Only reward scrap after clearing actual waves (from visit 2 onwards)
            if (this.shopVisitCount > 1) {
                this.addScrap(CONFIG.SURVIVAL_REWARD);
            }
            this.physics.world.pause();
        });

        this.events.on('shopClosed', () => {
            this.physics.world.resume();
            this.startNextStage();
        });

        this.events.on('upgradeSpeed', (tier) => {
            this.player.setSpeedTier(tier);
        });

        this.events.on('upgradePower', (tier) => {
            this.player.setPowerTier(tier);
        });

        this.events.on('buyShield', () => {
            this.player.applyShield();
        });

        this.events.on('upgradeMaxHealth', () => {
            this.player.maxHealth += 2; // +1 full bar = +2 HP
            const minHealth = Math.ceil(this.player.maxHealth / 2);
            if (this.player.health < minHealth) {
                this.player.health = minHealth;
            }
            this.events.emit('updateMaxHealthDisplay', this.player.maxHealth);
            this.events.emit('updateHealth', this.player.health);
        });

        this.events.on('bossDefeated', () => {
            this.isBossActive = false;
            this.isStageEnding = true;
            this.time.delayedCall(2000, () => {
                this.triggerShop();
            });
        });

        this.events.on('requestRevive', () => {
            const reviveCost = CONFIG.REVIVE_BASE_COST + (this.reviveCount * 150);
            if (this.scrap >= reviveCost && this.reviveCount < CONFIG.MAX_REVIVES) {
                this.revivePlayer(reviveCost);
            }
        });

        // Difficulty ramping
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.spawnInterval = Math.max(CONFIG.MIN_SPAWN_INTERVAL, this.spawnInterval * CONFIG.DIFFICULTY_RAMP);
            },
            loop: true
        });

        // Initial setup - wait a frame for UI to be ready
        this.time.delayedCall(1, () => {
            this.events.emit('updateMaxHealthDisplay', this.player.maxHealth);
            this.events.emit('updateHealth', this.player.health);
            this.events.emit('updateStage', this.currentStage);
            
            // Show initial shop
            const uiScene = this.scene.get('UIScene');
            uiScene.showShop(true);
        });
    }

    revivePlayer(cost) {
        this.addScrap(-cost);
        this.reviveCount++;
        this.player.isDead = false;
        this.player.health = Math.ceil(this.player.maxHealth / 2);
        this.player.setPosition(200, 540);
        this.player.startImmunity(3000); // 3 seconds of immunity on revive
        this.events.emit('updateHealth', this.player.health);
        this.events.emit('playerRevived', this.reviveCount);
        this.physics.world.resume();
        this.isPaused = false; // Important: ensure scene update resumes
    }

    startNextStage() {
        this.isStageEnding = false;
        this.stageTimeLeft = CONFIG.SHOP_INTERVAL;
        this.events.emit('updateStage', this.currentStage);
    }

    update(time, delta) {
        const uiScene = this.scene.get('UIScene');
        if (uiScene.shopIsActive || this.isPaused) {
            return;
        }

        this.sky.tilePositionX += 1;
        this.player.update(time, { ...this.cursors, ...this.keys });

        if (!this.isStageEnding) {
            this.stageTimeLeft -= delta;
            this.events.emit('updateStageTimer', Math.ceil(this.stageTimeLeft / 1000));

            if (this.stageTimeLeft <= 0) {
                this.endStage();
            }
        }

        if (time > this.nextSpawn && !this.isBossActive && !this.isStageEnding) {
            this.spawnEnemy();
            this.nextSpawn = time + this.spawnInterval;
        }
    }

    endStage() {
        this.isStageEnding = true;
        
        if (this.currentStage % CONFIG.BOSS_STAGE_INTERVAL === 0) {
            this.spawnBoss();
        } else {
            this.time.delayedCall(1000, () => {
                this.triggerShop();
            });
        }
    }

    spawnBoss() {
        this.isBossActive = true;
        const boss = new Enemy(this, 2000, 540, 'BOSS', this.currentStage);
        this.enemies.add(boss);
        this.events.emit('bossSpawned', boss);
    }

    triggerShop() {
        this.currentStage++;
        const uiScene = this.scene.get('UIScene');
        uiScene.showShop();
    }

    spawnEnemy(typeKey, x, y) {
        if (!typeKey) {
            const timeElapsed = this.time.now;
            const difficultyProgress = Math.min(1, timeElapsed / 300000); 
            
            let eliteChance = CONFIG.ELITE_SPAWN_CHANCE_START + (CONFIG.ELITE_SPAWN_CHANCE_MAX - CONFIG.ELITE_SPAWN_CHANCE_START) * difficultyProgress;
            let scoutThreshold = 0.6 - (difficultyProgress * 0.4);

            if (this.difficulty === 'hard') {
                eliteChance *= 1.5; // 50% more elites
                scoutThreshold += 0.2; // Less scouts, meaning more standard enemies
            }
            
            typeKey = 'STANDARD';
            const rand = Math.random();
            
            if (rand < eliteChance) {
                typeKey = 'ELITE';
            } else if (rand > scoutThreshold) { 
                typeKey = 'SCOUT';
            }
        }

        const spawnX = x || 2000;
        const spawnY = y || Phaser.Math.Between(100, 980);
        
        const enemy = new Enemy(this, spawnX, spawnY, typeKey, this.currentStage);
        this.enemies.add(enemy);
    }

    fireProjectile(x, y, ammoType) {
        const projectile = new Projectile(this, x, y, ammoType);
        this.projectiles.add(projectile);
    }

    fireEnemyProjectile(x, y, isBoss = false) {
        const projectile = new Projectile(this, x, y, null, true, isBoss);
        this.enemyProjectiles.add(projectile);
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.onHit(enemy);
    }

    handleEnemyProjectilePlayerCollision(projectile, player) {
        projectile.onHit(player);
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (!player.isDead) {
            const damage = enemy.isBoss ? 2 : 1;
            if (!enemy.isBoss) {
                enemy.takeDamage(10); 
            }
            player.takeDamage(damage);
        }
    }

    addScrap(amount) {
        this.scrap += amount;
        this.events.emit('updateScrap', this.scrap);
    }

    addScore(amount) {
        this.score += amount;
        this.events.emit('updateScore', this.score);
    }

    createExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion').setScale(0.5);
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 1,
            duration: 500,
            onComplete: () => explosion.destroy()
        });
    }

    gameOver() {
        this.isPaused = true;
        // Reload the page to ensure a clean state for the next playthrough
        window.location.reload();
    }
}
