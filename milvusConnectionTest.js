const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

async function testMilvusConnection() {
    const milvus = new MilvusClient({
        address: 'localhost:19530'
    });

    try {
        // Testa a conexão
        const result = await milvus.checkHealth();
        console.log('Conexão com Milvus:', result);
        
    } catch (error) {
        console.error('Erro ao conectar com o Milvus:', error);
    } finally {
        milvus.closeConnection();
    }
}

testMilvusConnection();
