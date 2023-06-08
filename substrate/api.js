import dotenv from "dotenv";
dotenv.config();

import { Sdk } from "@unique-nft/sdk/full";
import { Accounts } from "@unique-nft/accounts";
import { KeyringProvider } from "@unique-nft/accounts/keyring";

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

  const accounts = new Accounts();
  const keyringProvider = await accounts.addProvider(KeyringProvider, {
    type: "sr25519",
  });
  const account = keyringProvider.addSeed(SUBSTRATE_SEED);

  const sdk = new Sdk({
    baseUrl: REST_URL,
    signer: account,
  });

  return {
    sdk,
    address: account.address,
  };
}
