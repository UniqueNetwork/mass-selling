import { initSubstrate } from "./api.js";
import { writeToFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;

async function main() {
  console.log("build-csv:start");
  const { sdk, address } = await initSubstrate();

  console.log("sdk init");

  const { ids } = await sdk.collection.tokens({
    collectionId,
  });
  console.log(`Found tokens ${ids.length} in collection ${collectionId}`);

  const filteredIds = [];

  for (const tokenId of ids) {
    const token = await sdk.token.owner({ collectionId, tokenId });
    if (token.owner === address) {
      filteredIds.push(tokenId);
    }
  }

  console.log(`My tokens count: ${filteredIds.length}`);

  writeToFile(collectionId, filteredIds);

  console.log("build-csv:finish");
}

main();
