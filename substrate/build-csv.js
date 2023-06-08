import { initSubstrate } from "./api.js";
import { writeToFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;

async function main() {
  const { sdk, address } = await initSubstrate();

  const { ids } = await sdk.collection.tokens({
    collectionId,
  });

  const filteredIds = [];

  for (const tokenId of ids) {
    const token = await sdk.token.owner({ collectionId, tokenId });
    if (token.owner === address) {
      filteredIds.push(tokenId);
    }
  }

  writeToFile(collectionId, filteredIds);
}

main();
