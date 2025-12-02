import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Turbopack configuration
    turbopack: {
        // Optional: Add specific Turbopack experiments if needed
        experiments: {
            // Add any specific Turbopack configurations here
        }
    },

    // Optional webpack configuration (conditionally applied)
    webpack: (config, { isServer, webpack }) => {
        // Only apply custom webpack config if not using Turbopack
        if (!webpack.isWebpackCompiler()) {
            // Resolve aliases
            config.resolve.alias = {
                ...config.resolve.alias,
                'canvas': false,
            };

            // Fallback for node APIs
            if (!isServer) {
                config.resolve.fallback = {
                    ...config.resolve.fallback,
                    fs: false,
                    path: false,
                    crypto: false,
                };
            }
        }

        return config;
    },
    
    // Transpile specific packages
    transpilePackages: [
        '@langchain/community',
        '@langchain/openai',
        'pdfjs-dist'
    ],

    // Environment variables (if needed)
    env: {
        // Add any environment-specific configurations
    }
};

export default nextConfig;