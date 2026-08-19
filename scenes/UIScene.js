import Phaser from 'phaser';
import { CONFIG, UPGRADES, BOSS_HINTS } from '../config.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.scrap = CONFIG.INITIAL_SCRAP;
        this.health = CONFIG.PLAYER_HEALTH;
        this.maxHealth = CONFIG.PLAYER_HEALTH;
        this.shopTimerValue = 0;
        this.shopIsActive = false;
        this.shopVisitCount = 0;
        this.reviveCount = 0;
        
        this.speedTier = 0;
        this.powerTier = 0;
        this.hasShield = false;
        this.score = 0;

        // HUD - Stage & Timer
        this.stageText = this.add.text(960, 40, 'STAGE 1', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.stageTimerText = this.add.text(960, 80, '00:00', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Score Counter
        this.scoreText = this.add.text(1870, 40, 'SCORE: 0', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(1, 0);

        // Tiers Display
        this.speedTierText = this.add.text(50, 40, 'SPEED TIER: 0', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#00ffff'
        });
        this.powerTierText = this.add.text(50, 80, 'POWER TIER: 0', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#ff00ff'
        });

        // Scrap Counter
        this.scrapText = this.add.text(50, 130, `SCRAP: ${this.scrap}`, {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '32px',
            color: '#ffffff'
        });

        // Shield Status
        this.shieldText = this.add.text(50, 180, 'SHIELD: OFF', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '20px',
            color: '#aaaaaa'
        });

        // Health Hearts
        this.heartsGroup = this.add.group({
            defaultKey: 'heart_pixel',
            maxSize: 40
        });
        this.updateHearts();

        // Revive UI Container
        this.reviveContainer = this.add.container(960, 540).setAlpha(0).setDepth(100);
        const reviveBg = this.add.graphics();
        reviveBg.fillStyle(0x000000, 0.9);
        reviveBg.fillRect(-400, -200, 800, 400);
        this.reviveContainer.add(reviveBg);
        
        this.reviveTitle = this.add.text(0, -100, 'PILOT DOWN!', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.reviveContainer.add(this.reviveTitle);
        
        this.reviveDesc = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.reviveContainer.add(this.reviveDesc);
        
        this.reviveBtn = this.add.text(0, 80, 'REVIVE', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#111111',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.reviveContainer.add(this.reviveBtn);

        this.reviveCountdownText = this.add.text(0, -10, '', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '40px',
            color: '#ffff00'
        }).setOrigin(0.5);
        this.reviveContainer.add(this.reviveCountdownText);

        this.exitBtn = this.add.text(0, 160, 'GIVE UP', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#330000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            const gameScene = this.scene.get('GameScene');
            gameScene.gameOver();
        });
        this.reviveContainer.add(this.exitBtn);

        // Shop Container
        this.shopContainer = this.add.container(960, 540).setAlpha(0);
        
        const shopBg = this.add.graphics();
        shopBg.fillStyle(0x000000, 0.95);
        shopBg.lineStyle(4, 0xffffff, 1);
        shopBg.fillRoundedRect(-600, -450, 1200, 900, 20);
        shopBg.strokeRoundedRect(-600, -450, 1200, 900, 20);
        this.shopContainer.add(shopBg);

        const shopTitle = this.add.text(0, -400, 'BLACK MARKET HANGAR', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '42px',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.shopContainer.add(shopTitle);

        this.shopCountdownText = this.add.text(0, -340, '', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '40px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.shopContainer.add(this.shopCountdownText);

        // Boss Hint
        this.bossHintText = this.add.text(0, -290, '', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '14px',
            color: '#ffaa00',
            wordWrap: { width: 1000 }
        }).setOrigin(0.5);
        this.shopContainer.add(this.bossHintText);

        // Shop Items Area
        this.itemContainer = this.add.container(0, -20);
        this.shopContainer.add(this.itemContainer);

        // Close Button
        const closeButton = this.add.text(0, 380, 'CONTINUE TO NEXT STAGE', {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '24px',
            color: '#aaaaaa'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.hideShop());
        this.shopContainer.add(closeButton);

        // Event listeners
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateScrap', (val) => {
            this.scrap = val;
            this.scrapText.setText(`SCRAP: ${this.scrap}`);
            if (this.shopIsActive) this.refreshShopItems();
        });

        gameScene.events.on('updateScore', (val) => {
            this.score = val;
            this.scoreText.setText(`SCORE: ${this.score}`);
        });

        gameScene.events.on('updateHealth', (val) => {
            this.health = val;
            this.updateHearts();
            if (this.health <= 0) this.showReviveUI();
        });

        gameScene.events.on('updateMaxHealthDisplay', (val) => {
            this.maxHealth = val;
            this.updateHearts();
        });

        gameScene.events.on('updateShield', (active) => {
            this.hasShield = active;
            this.shieldText.setText(`SHIELD: ${active ? 'ACTIVE' : 'OFF'}`);
            this.shieldText.setColor(active ? '#00ffff' : '#aaaaaa');
        });

        gameScene.events.on('updateStage', (stage) => {
            this.stageText.setText(`STAGE ${stage}`);
            this.updateBossHint(stage);
        });

        gameScene.events.on('updateStageTimer', (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            this.stageTimerText.setText(`${mins}:${secs.toString().padStart(2, '0')}`);
        });

        gameScene.events.on('bossSpawned', () => {
            this.stageTimerText.setText('BOSS BATTLE');
            this.stageTimerText.setColor('#ff0000');
        });
        
        gameScene.events.on('bossDefeated', () => {
            this.stageTimerText.setText('VICTORY');
            this.stageTimerText.setColor('#00ff00');
        });

        gameScene.events.on('playerRevived', (count) => {
            this.reviveCount = count;
            this.hideReviveUI();
        });
    }

    showReviveUI() {
        if (this.reviveTimerEvent) return; // Already showing
        
        const gameScene = this.scene.get('GameScene');
        gameScene.physics.world.pause(); // Stop physics world
        gameScene.isPaused = true; // Stop GameScene's update loop
        
        const reviveCost = CONFIG.REVIVE_BASE_COST + (this.reviveCount * 150);
        const canAfford = this.scrap >= reviveCost;
        const attemptsLeft = CONFIG.MAX_REVIVES - this.reviveCount;
        
        this.reviveCountdown = 10;
        this.updateReviveCountdownText();
        
        this.reviveTimerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.reviveCountdown--;
                this.updateReviveCountdownText();
                if (this.reviveCountdown <= 0) {
                    gameScene.gameOver();
                }
            },
            repeat: 9
        });

        if (attemptsLeft > 0) {
            this.reviveTitle.setText('PILOT DOWN!');
            this.reviveDesc.setText(`COST: ${reviveCost} SCRAP\nLIMIT: ${this.reviveCount}/${CONFIG.MAX_REVIVES} USED`).setY(60);
            this.reviveBtn.setText('REVIVE').setVisible(true).setY(110);
            this.reviveBtn.setAlpha(canAfford ? 1 : 0.3);
            this.reviveBtn.setInteractive({ useHandCursor: canAfford });
            this.reviveBtn.off('pointerdown').on('pointerdown', () => {
                if (canAfford) gameScene.events.emit('requestRevive');
            });
            this.exitBtn.setY(180).setText('GIVE UP');
        } else {
            this.reviveTitle.setText('MISSION FAILED');
            this.reviveDesc.setText('ALL REVIVE ATTEMPTS EXHAUSTED').setY(60);
            this.reviveBtn.setVisible(false);
            this.exitBtn.setY(120).setText('MAIN MENU');
        }
        
        this.tweens.add({
            targets: this.reviveContainer,
            alpha: 1,
            duration: 500
        });
    }

    updateReviveCountdownText() {
        this.reviveCountdownText.setText(this.reviveCountdown.toString());
        this.tweens.add({
            targets: this.reviveCountdownText,
            scale: 1.5,
            duration: 200,
            yoyo: true
        });
    }

    hideReviveUI() {
        if (this.reviveTimerEvent) {
            this.reviveTimerEvent.destroy();
            this.reviveTimerEvent = null;
        }
        this.tweens.add({
            targets: this.reviveContainer,
            alpha: 0,
            duration: 300
        });
    }

    updateBossHint(stage) {
        const nextBossStage = Math.ceil(stage / CONFIG.BOSS_STAGE_INTERVAL) * CONFIG.BOSS_STAGE_INTERVAL;
        const hintIndex = (nextBossStage / CONFIG.BOSS_STAGE_INTERVAL) - 1;
        const hint = BOSS_HINTS[hintIndex] || BOSS_HINTS[BOSS_HINTS.length - 1];
        this.bossHintText.setText(`INTEL: ${hint}`);
    }

    updateHearts() {
        if (!this.heartsGroup) return;
        this.heartsGroup.clear(true, true);
        const startX = 70;
        const spacing = 60;
        
        // maxHealth is HP points. Each bar (full heart) is 2 points.
        const totalBars = Math.ceil(this.maxHealth / 2);
        
        for (let i = 0; i < totalBars; i++) {
            const barHP = (i * 2);
            const heartX = startX + (i * spacing);
            const heartY = 230;
            
            // Background heart (Black, slightly larger for border effect)
            const bgHeart = this.add.image(heartX, heartY, 'heart_pixel').setScale(0.13).setTint(0x000000);
            this.heartsGroup.add(bgHeart);
            
            if (this.health > barHP + 1) {
                // Full heart
                const heart = this.add.image(heartX, heartY, 'heart_pixel').setScale(0.12).setTint(0xff0000);
                this.heartsGroup.add(heart);
            } else if (this.health === barHP + 1) {
                // Half heart (Red overlay on left, black background shows through on right)
                const heart = this.add.image(heartX, heartY, 'heart_pixel').setScale(0.12).setTint(0xff0000);
                heart.setCrop(0, 0, 234, 391);
                this.heartsGroup.add(heart);
            }
        }
    }

    refreshShopItems() {
        this.itemContainer.removeAll(true);
        
        const nextSpeedCost = UPGRADES.SPEED.baseCost + (this.speedTier * UPGRADES.SPEED.costStep);
        const nextPowerCost = UPGRADES.POWER.baseCost + (this.powerTier * UPGRADES.POWER.costStep);
        const shieldCost = CONFIG.SHIELD_BASE_COST;
        const repairCost = CONFIG.HEALTH_RESTORE_BASE_COST + (Math.max(0, (this.health - CONFIG.PLAYER_HEALTH)) * CONFIG.HEALTH_COST_STEP);
        const maxHealthCost = CONFIG.MAX_HEALTH_UPGRADE_BASE_COST + (Math.floor((this.maxHealth - CONFIG.PLAYER_HEALTH) / 2) * CONFIG.MAX_HEALTH_UPGRADE_STEP);

        const items = [
            { 
                name: UPGRADES.SPEED.name, 
                type: 'speed', 
                cost: nextSpeedCost, 
                tier: this.speedTier, 
                max: UPGRADES.SPEED.maxTier,
                desc: 'Increases Firing Rate by 10% per level' 
            },
            { 
                name: UPGRADES.POWER.name, 
                type: 'power', 
                cost: nextPowerCost, 
                tier: this.powerTier, 
                max: UPGRADES.POWER.maxTier,
                desc: 'Increases Damage by 10% per level' 
            },
            { 
                name: 'DEFENSIVE SHIELD', 
                type: 'shield', 
                cost: shieldCost, 
                desc: 'Indefinite: Absorbs 1 Hit',
                disabled: this.hasShield
            },
            { 
                name: 'HEALTH REGENERATION', 
                type: 'health', 
                cost: repairCost, 
                desc: 'Restores 0.5 Heart',
                disabled: this.health >= this.maxHealth
            }
        ];

        items.forEach((item, index) => {
            const yOffset = (index * 115) - 200;
            const isAffordable = this.scrap >= item.cost && !item.disabled && (item.tier === undefined || item.tier < item.max);
            
            const itemBox = this.add.graphics();
            itemBox.fillStyle(isAffordable ? 0x222222 : 0x0a0a0a, 1);
            itemBox.fillRect(-550, yOffset, 1100, 100);
            this.itemContainer.add(itemBox);

            const titleSuffix = (item.tier !== undefined ? ` (T${item.tier})` : '');
            const itemName = this.add.text(-530, yOffset + 10, item.name + titleSuffix, {
                fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
                fontSize: '20px',
                color: isAffordable ? '#ffffff' : '#555555'
            });
            this.itemContainer.add(itemName);

            const itemDesc = this.add.text(-530, yOffset + 40, item.desc, {
                fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
                fontSize: '14px',
                color: '#888888'
            });
            this.itemContainer.add(itemDesc);

            const displayCost = (item.tier !== undefined && item.tier >= item.max) ? 'MAXED' : `COST: ${item.cost}`;
            const itemCostText = this.add.text(-530, yOffset + 65, displayCost, {
                fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
                fontSize: '16px',
                color: isAffordable ? '#ffcc00' : '#444400'
            });
            this.itemContainer.add(itemCostText);

            const buyButton = this.add.text(380, yOffset + 25, 'BUY', {
                fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
                fontSize: '24px',
                color: isAffordable ? '#00ff00' : '#333333',
                backgroundColor: isAffordable ? '#111111' : '#050505',
                padding: { x: 20, y: 10 }
            });
            
            if (isAffordable) {
                buyButton.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => this.handlePurchase(item));
            }
            this.itemContainer.add(buyButton);
        });
    }

    handlePurchase(item) {
        if (!this.shopIsActive) return;
        const gameScene = this.scene.get('GameScene');

        if (item.type === 'speed') {
            gameScene.addScrap(-item.cost);
            this.speedTier++;
            this.speedTierText.setText(`SPEED TIER: ${this.speedTier}`);
            gameScene.events.emit('upgradeSpeed', this.speedTier);
            this.showBuyFeedback('FIRE RATE UP!');
        } else if (item.type === 'power') {
            gameScene.addScrap(-item.cost);
            this.powerTier++;
            this.powerTierText.setText(`POWER TIER: ${this.powerTier}`);
            gameScene.events.emit('upgradePower', this.powerTier);
            this.showBuyFeedback('DAMAGE UP!');
        } else if (item.type === 'shield') {
            gameScene.addScrap(-item.cost);
            gameScene.events.emit('buyShield');
            this.showBuyFeedback('SHIELD ACTIVE!');
        } else if (item.type === 'health') {
            gameScene.addScrap(-item.cost);
            this.health++;
            gameScene.player.health = this.health;
            gameScene.events.emit('updateHealth', this.health);
            this.showBuyFeedback('REPAIRED!');
        } else if (item.type === 'maxHealth') {
            gameScene.addScrap(-item.cost);
            gameScene.events.emit('upgradeMaxHealth');
            this.showBuyFeedback('MAX HP UP!');
        }
        this.refreshShopItems();
    }

    showShop(isInitial = false) {
        if (this.shopIsActive) return;
        this.shopIsActive = true;
        this.shopVisitCount++;
        
        const gameScene = this.scene.get('GameScene');
        gameScene.events.emit('shopOpened');
        this.refreshShopItems();

        this.tweens.add({
            targets: this.shopContainer,
            alpha: 1,
            duration: 300
        });

        // Initial shop lasts longer or has no timer? Let's give it 20s or just the standard
        this.shopTimerValue = isInitial ? 0 : Math.ceil(CONFIG.SHOP_DURATION / 1000);
        
        if (isInitial) {
            this.shopCountdownText.setVisible(false);
        } else {
            this.shopCountdownText.setVisible(true);
            this.updateShopCountdown();
            this.shopCountdownEvent = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.shopTimerValue--;
                    this.updateShopCountdown();
                    if (this.shopTimerValue <= 0) {
                        this.hideShop();
                    }
                },
                repeat: this.shopTimerValue - 1
            });
        }
        
        if (!isInitial) {
            const rewardText = this.add.text(960, 450, `SURVIVAL REWARD: +${CONFIG.SURVIVAL_REWARD} SCRAP`, {
                fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
                fontSize: '32px',
                color: '#ffff00'
            }).setOrigin(0.5).setAlpha(0);
            
            this.tweens.add({
                targets: rewardText,
                alpha: 1,
                y: 400,
                duration: 800,
                yoyo: true,
                hold: 1000,
                onComplete: () => rewardText.destroy()
            });
        }
    }

    updateShopCountdown() {
        this.shopCountdownText.setText(`CLOSES IN: ${this.shopTimerValue}s`);
        if (this.shopTimerValue <= 3) {
            this.shopCountdownText.setColor('#ff0000');
            this.tweens.add({
                targets: this.shopCountdownText,
                scale: 1.1,
                duration: 200,
                yoyo: true
            });
        } else {
            this.shopCountdownText.setColor('#ffffff');
            this.shopCountdownText.setScale(1);
        }
    }

    hideShop() {
        this.shopIsActive = false;
        if (this.shopCountdownEvent) this.shopCountdownEvent.destroy();
        const gameScene = this.scene.get('GameScene');
        gameScene.events.emit('shopClosed');
        this.tweens.add({ targets: this.shopContainer, alpha: 0, duration: 300 });
    }

    showBuyFeedback(text, color = '#00ff00') {
        const feedback = this.add.text(960, 100, text, {
            fontFamily: '"Press Start 2P", "Courier New", Courier, monospace',
            fontSize: '48px',
            color: color
        }).setOrigin(0.5);
        this.time.delayedCall(1000, () => feedback.destroy());
    }
}