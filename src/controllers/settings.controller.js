import { getSettingsFromDB, updateSettingsInDB } from '../models/settings.model.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await getSettingsFromDB();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao buscar configurações.' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        // Pega apenas o layout do corpo da requisição
        const { layout } = req.body;
        if (!layout) {
            return res.status(400).json({ message: 'Layout não fornecido.' });
        }
        const updatedSettings = await updateSettingsInDB({ layout });
        res.status(200).json(updatedSettings);
    } catch (error) {
        res.status(500).json({ message: 'Falha ao atualizar configurações.' });
    }
};