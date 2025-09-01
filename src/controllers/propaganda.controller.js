// Importe as novas funções do model
import { uploadFileToGCS, addPropagandaToDB } from "../models/storage.model.js";
import {
  deletePropagandaFromDB,
  deleteFileFromGCS,
} from "../models/storage.model.js"; // Adicione os novos imports

export const uploadPropaganda = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    // A duração virá no corpo do formulário
    const { duration } = req.body;

    const publicUrl = await uploadFileToGCS(req.file);

    const novaPropaganda = {
      id: Date.now(),
      fileName: req.file.originalname,
      url: publicUrl,
      type: req.file.mimetype.startsWith("video") ? "video" : "image",
      // Use a duração do formulário. Se não vier, use 15 como padrão.
      duration_seconds: parseInt(duration, 10) || 15,
    };

    await addPropagandaToDB(novaPropaganda);

    res.status(201).json({
      message: "Upload e registro realizados com sucesso!",
      data: novaPropaganda,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({
      message: "Falha ao realizar o upload.",
      error: error.message,
    });
  }
};

// CRIE ESTA NOVA FUNÇÃO ABAIXO NO MESMO ARQUIVO
import { getAllPropagandasFromDB } from "../models/storage.model.js";

export const getPropagandas = async (req, res) => {
  try {
    const propagandas = await getAllPropagandasFromDB();
    res.status(200).json(propagandas);
  } catch (error) {
    console.error("Erro ao buscar propagandas:", error);
    res.status(500).json({
      message: "Falha ao buscar propagandas.",
      error: error.message,
    });
  }
};

export const deletePropaganda = async (req, res) => {
  try {
    // O ID virá da URL, ex: /api/propagandas/1756565590007
    const idToDelete = parseInt(req.params.id, 10);

    // Primeiro, deleta do DB. A função retorna a propaganda deletada.
    const propagandaDeletada = await deletePropagandaFromDB(idToDelete);

    // Agora, usa a URL da propaganda deletada para apagar o arquivo no GCS.
    if (propagandaDeletada && propagandaDeletada.url) {
      await deleteFileFromGCS(propagandaDeletada.url);
    }

    res.status(200).json({ message: "Propaganda deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar propaganda:", error);
    res.status(500).json({
      message: "Falha ao deletar propaganda.",
      error: error.message,
    });
  }
};
