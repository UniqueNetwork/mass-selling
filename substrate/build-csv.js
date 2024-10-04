import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { initSubstrate } from "./api.js";
import { writeToFile } from "../files.js";
import { Address } from '@unique-nft/utils';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const collectionId = +process.env.COLLECTION_ID;
const NUM_WORKERS = 4; // Adjust this based on your needs

if (isMainThread) {
  async function main() {
    console.log("build-csv:start");
    const { sdk, address } = await initSubstrate();

    console.log("sdk init");

    const { ids } = await sdk.collection.tokens({
      collectionId,
    });
    console.log(`Found tokens ${ids.length} in collection ${collectionId}`);

    const chunkSize = Math.ceil(ids.length / NUM_WORKERS);
    const workers = [];
    const filteredIds = [];

    for (let i = 0; i < NUM_WORKERS; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const worker = new Worker(__filename, {
        workerData: { ids: ids.slice(start, end), collectionId, address }
      });

      worker.on('message', (message) => {
        filteredIds.push(...message);
      });

      worker.on('error', (error) => {
        console.error(`Worker error: ${error}`);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
        if (workers.every(w => w.exitCode !== null)) {
          console.log(`My tokens count: ${filteredIds.length}`);
          writeToFile(collectionId, filteredIds);
          console.log("build-csv:finish");
        }
      });

      workers.push(worker);
    }
  }

  main();
} else {
  // This code runs in worker threads
  async function workerFunction() {
    const { ids, collectionId, address } = workerData;
    const { sdk } = await initSubstrate();
    const filteredIds = [];

    for (const tokenId of ids) {
      const token = await sdk.token.owner({ collectionId, tokenId });
      if (Address.normalize.substrateAddress(token.owner) === Address.normalize.substrateAddress(address)) {
        filteredIds.push(tokenId);
      }
      console.log(`check owner ${ids.indexOf(tokenId) + 1}/${ids.length}, tokenId: ${tokenId}`);
    }

    parentPort.postMessage(filteredIds);
  }

  workerFunction();
}
