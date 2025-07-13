import config from "./config";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export const client =  new SuiClient({
    url: config.suiProviderUrl,
});

export const keypair = new Ed25519Keypair();