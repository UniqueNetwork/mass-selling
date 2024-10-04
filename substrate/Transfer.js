import { readFileSync } from "fs";
import { initSubstrate } from "./api.js";
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';

const collectionId = process.env.COLLECTION_ID;

function printHeader(text) {
  const border = '='.repeat(text.length + 4);
  console.log(`\n${border}`);
  console.log(`| ${text} |`);
  console.log(`${border}\n`);
}

function printProgress(current, total) {
  const percentage = Math.floor((current / total) * 100);
  const filledWidth = Math.floor((percentage / 100) * 20);
  const emptyWidth = 20 - filledWidth;
  const progressBar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
  console.log(`[${progressBar}] ${percentage}% (${current}/${total})`);
}

async function readCSV(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read CSV file ${filePath}: ${error.message}`);
  }
}

function validateAddresses(addresses) {
  const invalidAddresses = addresses.filter(address => {
    try {
      encodeAddress(
        isHex(address)
          ? hexToU8a(address)
          : decodeAddress(address)
      );
      return false; // Address is valid
    } catch (error) {
      return true; // Address is invalid
    }
  });

  if (invalidAddresses.length > 0) {
    throw new Error(`Invalid addresses found: ${invalidAddresses.join(', ')}`);
  }
}

function validateTokenIds(tokenIds) {
  const invalidTokenIds = tokenIds.filter(id => isNaN(parseInt(id)));
  if (invalidTokenIds.length > 0) {
    throw new Error(`Invalid token IDs found: ${invalidTokenIds.join(', ')}`);
  }
}

async function main() {
  try {
    printHeader("NFT Transfer Process");
    console.log("🚀 Initiating transfer process...");

    if (!collectionId) {
      throw new Error("COLLECTION_ID environment variable is not set");
    }

    console.log("📂 Reading CSV files...");
    const collectionCsv = await readCSV(`${process.cwd()}/collection_717.csv`);
    const addressesCsv = await readCSV(`${process.cwd()}/addresses.csv`);

    console.log("🔗 Initializing Substrate connection...");
    const { sdk, address } = await initSubstrate();

    console.log("🔢 Processing CSV data...");
    const collectionData = collectionCsv.split("\n").map((line) => line.split(","));
    const addressesData = addressesCsv.split("\n").map((line) => line.split(",").map(item => item.trim()));

    const tokenIds = collectionData.slice(1).map((row) => row[0]);
    const toAddresses = addressesData.slice(1).map((row) => row[0]).filter(Boolean);

    validateTokenIds(tokenIds);
    validateAddresses(toAddresses);

    console.log(`📊 Summary:`);
    console.log(`   Tokens to airdrop: ${tokenIds.length}`);
    console.log(`   Recipient addresses: ${toAddresses.length}`);

    if (tokenIds.length === 0 || toAddresses.length === 0) {
      throw new Error("No tokens or addresses found in CSV files");
    }

    if (tokenIds.length % toAddresses.length !== 0) {
      console.warn("⚠️  Warning: The number of tokens cannot be evenly divided among the addresses");
      console.warn(`   Number of tokens: ${tokenIds.length}`);
      console.warn(`   Number of addresses: ${toAddresses.length}`);
      console.warn("   Some addresses may receive more tokens than others.");
    }

    printHeader("Starting Transfers");
    const transfers = [];
    const errors = [];

    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const toAddress = toAddresses[i % toAddresses.length];

      console.log(`\n🔄 Transfer ${i+1}/${tokenIds.length}:`);
      console.log(`   Token ID: ${tokenId}`);
      console.log(`   To: ${toAddress}`);

      const args = { address, to: toAddress, collectionId, tokenId };

      try {
        const result = await sdk.token.transfer.submitWaitResult(args);
        console.log(`✅ Successfully transferred token ${tokenId} to ${toAddress}`);
        transfers.push(result.parsed);
      } catch (error) {
        console.error(`❌ Error transferring token ${tokenId} to ${toAddress}: ${error.message}`);
        errors.push({ tokenId, toAddress, error: error.message });
      }

      printProgress(i + 1, tokenIds.length);
    }

    printHeader("Transfer Process Complete");
    console.log(`🎉 Successfully transferred ${transfers.length} out of ${tokenIds.length} tokens.`);
    
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} transfers failed. Check the logs for details.`);
      console.log("Failed transfers:");
      errors.forEach(({ tokenId, toAddress, error }) => {
        console.log(`   Token ${tokenId} to ${toAddress}: ${error}`);
      });
    }

    // Save error log to file
    if (errors.length > 0) {
      const errorLog = errors.map(({ tokenId, toAddress, error }) => 
        `Token ${tokenId},${toAddress},${error}`
      ).join('\n');
      await writeFile('error_log.csv', errorLog);
      console.log("Error log saved to error_log.csv");
    }

  } catch (error) {
    console.error("❌ An unexpected error occurred:", error.message);
    process.exit(1);
  }
}

console.log(`
 _   _ _____ _____   _____                    __         
| \\ | |  ___|_   _| |_   _| __ __ _ _ __  ___ / _| ___ _ __ 
|  \\| | |_    | |     | || '__/ _\` | '_ \\/ __| |_ / _ \\ '__|
| |\\  |  _|   | |     | || | | (_| | | | \\__ \\  _|  __/ |   
|_| \\_|_|     |_|     |_||_|  \\__,_|_| |_|___/_|  \\___|_|   
`);

main().catch(error => console.error("❌ An unexpected error occurred:", error));
