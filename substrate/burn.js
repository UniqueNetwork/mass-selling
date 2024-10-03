import { initSubstrate } from "./api.js";
import { loadFromFile } from "../files.js";
const collectionId = +process.env.COLLECTION_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;

import axios from "axios";

axios.defaults.timeout = 30000; // Set timeout to 30 seconds

async function main() {
  const { sdk, address } = await initSubstrate();
  console.log("=============Burning tokens================");
  try {
    const tokens = loadFromFile(collectionId);
    for (const { tokenId } of tokens) {
      console.log(`Burning token ${tokenId}`);
      await burn(address, sdk, tokenId);
      console.log(`Burned token ${tokenId}`);
    }
  } catch (error) {
    console.error(error);
    return;
  }
}

async function burn(address, sdk, tokenId) {
  await sdk.token.burn({
    collectionId,
    tokenId,
    amount: 1,
  });
}

main();
