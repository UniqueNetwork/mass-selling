import fs from "fs";

export function writeToFile(collectionId, ids) {
  const defaultPrice = process.env.PRICE ?? 1; // Price without decimals part
  const defaultCurrency = process.env.CURRENCY ?? 0; // Currency from .env or UNQ (0)

  const out = ids
    .sort((a, b) => a - b)
    .map((id) => `${id},${defaultPrice},${defaultCurrency}`)
    .join("\n");

  const filename = `collection_${collectionId}.csv`;

  fs.writeFileSync(
    filename,
    `token id,price,currency
${out}`
  );

  console.log(`saved to file: ${filename}`);
}

export function loadFromFile(collectionId) {
  const filename = `collection_${collectionId}.csv`;

  if (!fs.existsSync(filename)) {
    throw new Error(`File ${filename} not found`);
  }

  return fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const data = line.split(",");
      const tokenId = +data[0];

      if (!tokenId) {
        throw new Error("Invalid tokenId in csv file");
      }

      const price = +data[1];
      if (!price) {
        throw new Error("Invalid price in csv file");
      }

      const currency = +data[2];
      if (!currency) {
        throw new Error("Invalid currency in csv file");
      }

      // TODO: move to params
      if (currency !== 0 && currency !== 437) throw Error("Wrong currency");

      return {
        tokenId,
        price,
        currency,
      };
    });
}
