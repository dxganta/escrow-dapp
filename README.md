# Medius: Onchain Escrow using Game Theory

## Demo:
Suppose "A" wants to hire "B" for building a simple website for $500.
To initiate the transaction, the buyer (A) needs to lock double the transaction amount ($1000) and the seller (B) needs to lock an amount equal the transaction amount($500) in the smart contract.

Once locked, they will be able to withdraw the money only in the case of an agreement.
Suppose B delivers the website to A, and both of them agree that the product has been delivered, thus a yes-yes agreement. 
In this case, the contract will release $500 to A & $1000 to B. Thus B will have got the fees of $500 for his product.

Suppose B cannot deliver the website to A (maybe B got sick), and both of them agree that the product is not delivered, thus a no-no agreement.
In this case, the contract will release $1000 to A & $500 to B. Thus both of them will get their initial lock amounts back.

Whereas, in the case of a dispute they won't be able to withdraw their initial lock amounts thus losing them. In case B cheats he will lose $500 and in case A cheats, 
he will lose $500 ( $500 because the only scenario where A (buyer) cheats will be when he denies receipt of product even after receiving product). Thus, it is both 
in their best interests to come to an agreement be it yes-yes or no-no.

## Demo Video:
<iframe src="https://www.youtube.com/watch?v=SgkRjRihi9M"></iframe>

## Deployed Addresses
1. Ropsten Testnet : [0xd89154ca52d04d4A211BfA671Bb45437fc180d52](https://ropsten.etherscan.io/address/0xd89154ca52d04d4A211BfA671Bb45437fc180d52#writeContract)
2. Goerli Testnet: [0xB8EBd0A6b7c1F5873DD84A1E37a0b331dd8786cD](https://goerli.etherscan.io/address/0xB8EBd0A6b7c1F5873DD84A1E37a0b331dd8786cD#writeContract)

## Work in Progress
1. A beautiful reactjs UI to interact with the contract

## Escrow uses
 1. Freelancing
 2. Real Estate Transactions
 3. Mortgage Transactions
 4. Mergers & Acquisitions
 5. Betting Markets









