/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
        config.experiments = {
        asyncWebAssembly: true,
        layers: true,
        topLevelAwait: true,
        };
    
        return config;
    },
    // Add env { API_KEY: process.env.API_KEY}
    env:{
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
        PINECONE_API_KEY: process.env.PINECONE_API_KEY,
        PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
        PINECONE_INDEX: process.env.PINECONE_INDEX,
        BLOB_READ_WRITE: process.env.BLOB_READ_WRITE,
    }
};

export default nextConfig;
