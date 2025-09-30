import { initSubstrate } from "./api.js";
import { writeToFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;

async function main() {
  console.log("build-csv:start");
  const { sdk, address } = await initSubstrate();

  console.log("sdk init");

  const stats = await sdk.collection.accountTokens({
    address,
    collectionId
  });

  console.log(`My tokens count: ${stats.length}`);

  writeToFile(collectionId, stats.map(s => s.tokenId));

  console.log("build-csv:finish");
}

main();
