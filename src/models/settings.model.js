import fs from 'fs/promises';
const DB_PATH = 'database.json';

export const getSettingsFromDB = async () => {
    const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbRaw);
    return db.settings || {};
};

export const updateSettingsInDB = async (newSettings) => {
    const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(dbRaw);

    // Mescla as configurações existentes com as novas
    db.settings = { ...db.settings, ...newSettings };

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    return db.settings;
};