import fs from "fs";
import { initSubstrate } from "./api.js";
import { loadFromFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = JSON.parse(fs.readFileSync("contract-abi.json").toString());

async function main() {
  console.log("delist:start");

  const { sdk, address } = await initSubstrate();
  const tokens = loadFromFile(collectionId);

  for (const { tokenId } of tokens) {
    await revoke(address, sdk, tokenId);
  }

  console.log("delist:finish");
}

async function revoke(address, sdk, tokenId) {
  console.log(`---> start revoke token: ${tokenId}`);

  const callArgs = {
    functionName: "revoke",
    address,
    functionArgs: [collectionId, tokenId, 1],
    contract: {
      address: contractAddress,
      abi,
    },
  };

  try {
    await sdk.evm.call({ ...callArgs, senderAddress: address });
  } catch (err) {
    console.log("sell error", err.message);
    return;
  }

  const tx = await sdk.evm.send(callArgs);

  console.log(`<--- complete revoke token: ${tokenId}`, tx.result.isSuccessful);
}

main();
