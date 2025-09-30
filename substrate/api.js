import dotenv from "dotenv";
dotenv.config();

import { UniqueChain } from "@unique-nft/sdk";
import { Sr25519Account } from "@unique-nft/sr25519";

export async function initSubstrate() {
  const { SUBSTRATE_SEED, REST_URL, CONTRACT_ADDRESS, COLLECTION_ID } =
    process.env;

  if (!REST_URL) {
    console.log("REST_URL not found");
    process.exit(-1);
  }

  if (!SUBSTRATE_SEED) {
    console.log("SUBSTRATE_SEED not found");
    process.exit(-1);
  }

  if (!CONTRACT_ADDRESS) {
    console.log("CONTRACT_ADDRESS not found");
    process.exit(-1);
  }

  if (!COLLECTION_ID) {
    console.log("COLLECTION_ID not found");
    process.exit(-1);
  }

  const account = Sr25519Account.fromUri(SUBSTRATE_SEED);

  const sdk = UniqueChain({
    baseUrl: REST_URL,
    account,
  });

  return {
    sdk,
    address: account.address,
  };
}
