export const CONFIG = {
    SCREEN_WIDTH: 1920,
    SCREEN_HEIGHT: 1080,
    PLAYER_SPEED: 400,
    PLAYER_HEALTH: 6, // 6 HP = 3 full bars
    MAX_PLAYER_HEALTH_LIMIT: 20, // Max 10 bars
    ENEMY_SPEED_MIN: 200,
    ENEMY_SPEED_MAX: 400,
    SPAWN_INTERVAL: 1800, 
    DIFFICULTY_RAMP: 0.97, 
    MIN_SPAWN_INTERVAL: 600,
    ELITE_SPAWN_CHANCE_START: 0.05,
    ELITE_SPAWN_CHANCE_MAX: 0.3,
    INITIAL_SCRAP: 200,
    SCRAP_PER_KILL: 10,
    ELITE_SCRAP_REWARD: 25,
    SCOUT_SCRAP_REWARD: 5,
    SURVIVAL_REWARD: 50,
    SHOP_INTERVAL: 30000, 
    SHOP_DURATION: 15000, 
    SHOP_PRICE_GROWTH: 0, 
    HEALTH_RESTORE_BASE_COST: 50,
    HEALTH_COST_STEP: 25,
    SHIELD_BASE_COST: 150,
    MAX_HEALTH_UPGRADE_BASE_COST: 200,
    MAX_HEALTH_UPGRADE_STEP: 50,
    BOSS_STAGE_INTERVAL: 5,
    REVIVE_BASE_COST: 300,
    MAX_REVIVES: 2,
};

export const ENEMY_TYPES = {
    SCOUT: {
        texture: 'enemy_plane_1',
        health: 1,
        speedMult: 1.3,
        scale: 0.18,
        tint: 0xffffff,
        fireRate: 3000
    },
    STANDARD: {
        texture: 'enemy_plane_1',
        health: 3,
        speedMult: 1.1,
        scale: 0.25,
        tint: 0xaaaaaa,
        fireRate: 2500
    },
    ELITE: {
        texture: 'enemy_plane_1',
        health: 7,
        speedMult: 0.8,
        scale: 0.4,
        tint: 0xff8888,
        isElite: true,
        fireRate: 2000
    },
    BOSS: {
        texture: 'enemy_plane_1',
        health: 100,
        speedMult: 0.3,
        scale: 1.2,
        tint: 0xff0000,
        isBoss: true,
        fireRate: 2000
    }
};

export const SCORES = {
    SCOUT: 1,
    STANDARD: 2,
    ELITE: 4,
    BOSS: 10
};

export const UPGRADES = {
    SPEED: {
        name: 'Rapid Fire',
        baseCost: 100,
        costStep: 25,
        maxTier: 10
    },
    POWER: {
        name: 'Heavy Rounds',
        baseCost: 100,
        costStep: 25,
        maxTier: 10
    }
};

export const AMMO_TYPES = {
    STANDARD: {
        name: 'Standard',
        damage: 1,
        speed: 1000,
        fireRate: 450,
        scale: 0.15,
        texture: 'missile_std'
    },
    ENEMY: {
        scale: 0.25,
        speed: 550
    }
};

export const BOSS_HINTS = [
    "STAGE 5: THE SWARMER - Summons reinforcements and fires rapid volleys.",
    "STAGE 10: THE BEAMER - Deploys devastating thermal lasers.",
    "STAGE 15: THE VOID - Rapid-fire missiles and heavy armor.",
    "STAGE 20: THE ANNIHILATOR - Combines all previous technologies.",
    "BEYOND: UNKNOWN THREATS DETECTED."
];