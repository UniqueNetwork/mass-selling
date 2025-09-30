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

  for (const { tokenId, price, currency } of tokens) {
    await approveIfNeed(sdk, tokenId);

    await sell(sdk, address, tokenId, price, currency);
  }

  console.log("selling:finish");
}

async function approveIfNeed(sdk, tokenId) {
  const { isApproved } = await sdk.token.getApproved({
    collectionId,
    tokenId,
    spender: contractAddress,
  });

  if (!isApproved) {
    console.log("---> start approve contract");
    await sdk.token.approve({
      collectionId,
      tokenId,
      spender: contractAddress,
    });
    console.log("<--- complete approve contract");
  }
}

async function sell(sdk, address, tokenId, price, currency) {
  console.log(`---> start selling token: ${tokenId}, price: ${price}`);

  let decimals;

  switch (currency) {
    case 0:
      decimals = BigInt("1000000000000000000");
      break;
    case 437:
      decimals = BigInt("10000000000");
      break;
    default:
      throw Error("Wrong currency");
  }

  const priceBn = (BigInt(price) * decimals).toString();

  const sellerCross = Address.extract.ethCrossAccountId(address);

  const callArgs = {
    functionName: "put",
    functionArgs: [[collectionId, tokenId, 1, currency, priceBn, sellerCross]],
    contract: {
      address: contractAddress,
      abi,
    },
    gasLimit: 200000,
  };

  try {
    await sdk.evm.call({ ...callArgs, senderAddress: address });
  } catch (err) {
    console.log("sell error", err.message);
    return;
  }
  const tx = await sdk.evm.send(callArgs);
  console.log("Is completed:", tx.result.isSuccessful);

  console.log(`<--- complete sell token: ${tokenId}`);
}

main();
