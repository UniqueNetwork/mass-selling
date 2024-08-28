import fs from "fs";
import { Address } from "@unique-nft/utils";
import { initSubstrate } from "./api.js";
import { loadFromFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;

const abi = JSON.parse(fs.readFileSync("contract-abi.json").toString());

async function main() {
  console.log("selling:start");
  const { sdk, address } = await initSubstrate();
  const tokens = loadFromFile(collectionId);

  const contract = await sdk.evm.contractConnect(contractAddress, abi);

  for (const { tokenId, price } of tokens) {
    await approveIfNeed(sdk, address, tokenId);

    await sell(address, contract, tokenId, price);
  }

  console.log("selling:finish");
}

async function approveIfNeed(sdk, address, tokenId) {
  const { isAllowed } = await sdk.token.allowance({
    collectionId,
    tokenId,
    from: address,
    to: contractAddress,
  });

  if (!isAllowed) {
    console.log("---> start approve contract");
    await sdk.token.approve({
      address: address,
      collectionId,
      tokenId,
      isApprove: true,
      spender: contractAddress,
    });
    console.log("<--- complete approve contract");
  }
}

async function sell(address, contract, tokenId, price) {
  console.log(`---> start sell token: ${tokenId}, price: ${price}`);

  const priceBn = BigInt(price) * BigInt("1000000000000000000");

  const callArgs = {
    funcName: "put",
    address,
    args: {
      collectionId,
      tokenId,
      price: priceBn.toString(),
      currency: 0,
      amount: 1,
      seller: Address.extract.ethCrossAccountId(address),
    },
  };

  try {
    await contract.call(callArgs);
  } catch (err) {
    console.log("sell error", err.message, err.details);
    return;
  }
  const tx = await contract.send.submitWaitResult(callArgs);
  console.log("Is completed:", tx.isCompleted);

  console.log(`<--- complete sell token: ${tokenId}`);
}

main();
