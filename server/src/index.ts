import express  from "express";
import config from "./config/config";
import { keypair } from "./config/suiProvider";

const app = express();

app.use(express.json());

console.log(keypair);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});