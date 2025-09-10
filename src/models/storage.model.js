import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs/promises";

// Carrega as variáveis de ambiente
const projectId = process.env.GCP_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET_NAME;

const credentialsJson = JSON.parse(process.env.GCS_CREDENTIALS);

// Inicializa o cliente do Storage
// A biblioteca automaticamente busca as credenciais no caminho definido
// em GOOGLE_APPLICATION_CREDENTIALS no arquivo .env
const storage = new Storage({
  projectId: projectId,
  credentials: credentialsJson, // <--- ALTERAÇÃO IMPORTANTE
});

const bucket = storage.bucket(bucketName);

/**
 * Faz upload de um arquivo para o Google Cloud Storage.
 * @param {Express.Multer.File} file - O objeto de arquivo do Multer.
 * @returns {Promise<string>} - A URL pública do arquivo enviado.
 */
export const uploadFileToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Nenhum arquivo para upload fornecido."));
      return;
    }

    // Cria um nome de arquivo único para evitar sobreposições
    const uniqueFileName = `${Date.now()}-${path.basename(file.originalname)}`;
    const blob = bucket.file(uniqueFileName);

    // Cria um stream para escrever o arquivo no GCS
    const blobStream = blob.createWriteStream({
      resumable: false,
      gzip: true,
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      // Torna o arquivo público (ou gera uma URL assinada em um caso real mais seguro)
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    // Envia o buffer do arquivo para o stream
    blobStream.end(file.buffer);
  });
};

export const getAllPropagandasFromDB = async () => {
  const dbRaw = await fs.readFile("database.json", "utf-8");
  const db = JSON.parse(dbRaw);
  return db.propagandas;
};

// Nova função para adicionar uma nova propaganda no nosso JSON DB
export const addPropagandaToDB = async (propagandaData) => {
  const dbRaw = await fs.readFile("database.json", "utf-8");
  const db = JSON.parse(dbRaw);

  db.propagandas.push(propagandaData);

  // Escreve de volta no arquivo, com formatação bonita (espaçamento de 2)
  await fs.writeFile("database.json", JSON.stringify(db, null, 2));
};

export const deleteFileFromGCS = async (fileUrl) => {
  // Extrai o nome único do arquivo a partir da URL completa
  // Ex: "https://.../12345-nome.jpg" vira "12345-nome.jpg"
  const fileName = fileUrl.split("/").pop();

  try {
    await bucket.file(fileName).delete();
    console.log(`Arquivo ${fileName} deletado do GCS.`);
  } catch (error) {
    // Se o arquivo não existir, o GCS dá um erro. Podemos tratar isso como "não fatal".
    console.error(`Falha ao deletar ${fileName} do GCS:`, error.message);
  }
};

// Nova função para DELETAR uma propaganda do nosso JSON DB
export const deletePropagandaFromDB = async (id) => {
  const dbRaw = await fs.readFile("database.json", "utf-8");
  const db = JSON.parse(dbRaw);

  // Encontra a propaganda para pegar a URL antes de deletar
  const propagandaToDelete = db.propagandas.find((p) => p.id == id); // <-- MUDOU PARA ==
  if (!propagandaToDelete) {
    throw new Error("Propaganda não encontrada no banco de dados.");
  }

  // Filtra a lista, mantendo apenas as propagandas com ID diferente
  db.propagandas = db.propagandas.filter((p) => p.id != id); // <-- MUDOU PARA !=

  await fs.writeFile("database.json", JSON.stringify(db, null, 2));

  // Retorna a propaganda que foi deletada para que o controller possa usar a URL
  return propagandaToDelete;
};
