# Mass selling
Scripts for mass offering for the sale of tokens.

## Preparation

Create an `.evn` file in the project root with the content:
```dotenv
SUBSTRATE_SEED="here seed phrase"
COLLECTION_ID=123
CONTRACT_ADDRESS=0xafb17....
REST_URL=https://rest.unique.network/opal/v1
```

## Build .csv file
Create a .csv file with a list of tokens that belong to you
```shell
npm run sub-build
```
After executing the script, the `collection_123.csv` file will be created in the root of the project with the contents:

| token id | price |
|----------|-------|
| 1        | 1     |
| 2        | 1     |
| 3        | 1     |

All your tokens from the specified collection are registered in the table. All tokens have a default price of 1, you can change these prices to your liking and save the file there.

## Selling
To put up for sale all the tokens in the created .csv file for the price specified in the file, run the script:
```shell
npm run sub-sell
```

## Delist
To remove all tokens from the created .csv file from sale, run the script
```shell
npm run sub-delist
```
