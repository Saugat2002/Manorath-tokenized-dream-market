import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    suiProviderUrl: string;
    suiKeypair: string;
    nodeEnv: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 1338,
    suiKeypair: process.env.SUI_KEYPAIR || '0xg0g3ty04rkajsnfjahsuhweue87wrwe',
    suiProviderUrl: process.env.SUI_PROVIDER_URL || 'https://fullnode.testnet.sui.io:443',
    nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;