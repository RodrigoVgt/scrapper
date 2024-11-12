const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');
const Tokens = require('../models/tokens');
const MilvusQuery = require('../query/milvusQuery');

const MilvusController = {};

MilvusController.connect = async function() {
    const milvus = new MilvusClient({
        address: 'localhost:19530'
    });
    return milvus;
};

MilvusController.createCollection = async function(milvus) {
    const collectionName = 'tokens_collection';

    const schema = [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: 'question_id', data_type: DataType.VarChar, max_length: 50 },
        { name: 'token_vector', data_type: DataType.FloatVector, dim: 768 }
    ];

    await milvus.createCollection({
        collection_name: collectionName,
        fields: schema
    });
    console.log(`Coleção ${collectionName} criada.`);

    try {
        const index =await milvus.createIndex({
            collection_name: collectionName,
            field_name: 'token_vector',
            index_name: 'vector_index',
            index_type: 'IVF_FLAT', 
            params: { nlist: 64, metric_type: 'L2' }
        });
        console.log(`Índice criado para o campo token_vector.`);
    } catch (error) {
        console.error("Erro ao criar o índice:", error.message);
    }

    await milvus.loadCollection({ collection_name: collectionName });
    console.log(`Coleção ${collectionName} carregada para inserção de dados.`);

    return collectionName;
};


MilvusController.createTokens = async function() {
    const milvus = await this.connect();
    const collectionName = await this.createCollection(milvus);
    const tokens = await Tokens.find();

    const records = tokens.map(tokenData => ({
        question_id: tokenData.question.toString(),
        token_vector: tokenData.token
    }));

    try {
        const insertResult = await milvus.insert({
            collection_name: collectionName,
            fields_data: records
        });
        console.log('Tokens inseridos com sucesso:', insertResult);
    } catch (error) {
        console.error('Erro ao inserir tokens:', error);
    } finally {
        milvus.closeConnection();
    }
};

MilvusController.search = async function(token){
    try {
        const result = await MilvusQuery.search(token)
        return result
    } catch (error) {
        return null
    }
}

module.exports = MilvusController;
