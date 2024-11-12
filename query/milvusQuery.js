const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');

const MilvusQuery = {};

// Função de conexão com Milvus
async function connectToMilvus() {
    const milvus = new MilvusClient({
        address: 'localhost:19530'
    })
    try {
        await milvus.connect();
        console.log("Conectado ao Milvus com sucesso!");
        return milvus;
    } catch (err) {
        console.error("Erro ao conectar ao Milvus:", err);
    }
}

// Função para validar o vetor de entrada
function validateQueryVector(vector) {
    if (!Array.isArray(vector) || vector.length !== 768) {
        throw new Error("O vetor de consulta deve ser um array de 768 números.");
    }
    if (vector.some(v => typeof v !== 'number' || isNaN(v))) {
        throw new Error("O vetor de consulta deve conter apenas números válidos.");
    }
    return vector;
}

// Consulta para buscar tokens semelhantes
MilvusQuery.searchTokens = async function(queryVector) {
    const milvus = await this.connect();
    const collectionName = 'tokens_collection';

    try {
        // Valida o vetor de entrada
        const validatedVector = validateQueryVector(queryVector);


        await milvus.loadCollection({ collection_name: collectionName });

        // Configura e executa a consulta
        const searchParams = {
            collection_name: collectionName,
            expr: '',  // Use uma expressão de filtro, se necessário
            vectors: [validatedVector],
            search_params: { anns_field: 'token_vector', topk: 5, metric_type: 'L2', params: { nprobe: 10 } },
            output_fields: ['question_id']
        };

        const result = await milvus.search(searchParams);
        console.log('Resultados da consulta:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Erro ao realizar a consulta:', error);
    } finally {
        milvus.closeConnection();
    }
};

MilvusQuery.searchAllTokens = async function(token) {
    const milvus = await connectToMilvus();

    const collectionName = "tokens_collection";
  
    const searchParams = {
      nprobe: 5
    };

    const query = {
        collection_name: collectionName,
        vectors: token,
        field_name: 'token_vector',  
        params: searchParams,
        limit: 5,
        top_k: 10 
    }
  
    try {
      const result = await milvus.search(query);
  
      let bestResult = null;

      result.results.forEach(item => {
          if (!bestResult || (item.distance < bestResult.distance)) {
            bestResult = item;
          }
      });
  

      return bestResult
    } catch (err) {
      console.error("Erro ao realizar a busca:", err);
    }
  }

module.exports = MilvusQuery;

