import { initSubstrate } from "./api.js";
import { loadFromFile } from "../files.js";

const collectionId = +process.env.COLLECTION_ID;
const contractAddress = process.env.CONTRACT_ADDRESS;

async function main() {
  console.log("delist:start");

  const { sdk, address } = await initSubstrate();
  const tokens = loadFromFile(collectionId);

  for (const { tokenId } of tokens) {
    await removeApprove(sdk, address, tokenId);
  }

  console.log("delist:finish");
}

async function removeApprove(sdk, address, tokenId) {
  const { isAllowed } = await sdk.token.allowance({
    collectionId,
    tokenId,
    from: address,
    to: contractAddress,
  });

  if (isAllowed) {
    console.log("---> start remove approve");
    await sdk.token.approve({
      address: address,
      collectionId,
      tokenId,
      isApprove: false,
      spender: contractAddress,
    });
    console.log("<--- complete remove approve");
  }
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

  const { parsed } = await contract.send.submitWaitResult(callArgs);

  console.log(`<--- complete revoke token: ${tokenId}`, parsed);
}

main();
