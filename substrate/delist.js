import fs from "fs";
import { initSubstrate } from "./api.js";
import { loadFromFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;

async function main() {
  console.log("delist:start");

  const { sdk, address } = await initSubstrate();
  const tokens = loadFromFile(collectionId);

  const abi = JSON.parse(fs.readFileSync("contract-abi.json").toString());
  const marketContract = await sdk.evm.contractConnect(contractAddress, abi);

  for (const { tokenId } of tokens) {
    await revoke(address, marketContract, tokenId);
  }

  console.log("delist:finish");
}

async function revoke(address, contract, tokenId) {
  console.log(`---> start revoke token: ${tokenId}`);

  const callArgs = {
    funcName: "revoke",
    address,
    args: {
      collectionId,
      tokenId,
      amount: 1,
    },
  };

  try {
    await contract.call(callArgs);
  } catch (err) {
    console.log("sell error", err.message);
    return;
  }

  const tx = await contract.send.submitWaitResult(callArgs);

  console.log(`<--- complete revoke token: ${tokenId}`, tx.isCompleted);
}

main();
