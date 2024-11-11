const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');
const Tokens = require('../models/tokens');
const TokensNB = require('../models/tokensnb');

const MilvusController = {};

// Configura a conexão com o Milvus
MilvusController.connect = async function() {
    const milvus = new MilvusClient({
        address: 'localhost:19530'
    });
    return milvus;
};

MilvusController.createCollection = async function(milvus) {

    const schema = [
        { name: 'question_id', data_type: DataType.VARCHAR, max_length: 50 },
        { name: 'token_vector', data_type: DataType.FLOAT_VECTOR, dim: 768 } 
    ];

    const hasCollection = await milvus.hasCollection({ collection_name: collectionName });
    if (!hasCollection) {
        await milvus.createCollection({
            collection_name: collectionName,
            fields: schema
        });
        console.log(`Coleção ${collectionName} criada.`);
    } else {
        console.log(`Coleção ${collectionName} já existe.`);
    }
    return collectionName;
};

MilvusController.createTokens = async function() {
    const milvus = await this.connect();
    const collectionName = await this.createCollection(milvus, "tokens_collection");
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

module.exports = MilvusController;
