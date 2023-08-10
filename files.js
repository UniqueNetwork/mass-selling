import fs from "fs";

export function writeToFile(collectionId, ids) {
  const defaultPrice = 1;

  const out = ids
    .sort((a,b) => a - b)
    .map((id) => `${id},${defaultPrice}`)
    .join("\n");

  const filename = `collection_${collectionId}.csv`;

  fs.writeFileSync(
    filename,
    `token id,price
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

      return {
        tokenId,
        price,
      };
    });
}
