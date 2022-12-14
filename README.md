# Diamond-3-Hardhat Implementation

This is an implementation for [EIP-2535 Diamond Standard](https://github.com/ethereum/EIPs/issues/2535).

The standard loupe functions have been gas-optimized in this implementation and can be called in on-chain transactions. However keep in mind that a diamond can have any number of functions and facets so it is still possible to get out-of-gas errors when calling loupe functions. Except for the `facetAddress` loupe function which has a fixed gas cost.

**Note:** The loupe functions in DiamondLoupeFacet.sol MUST be added to a diamond and are required by the EIP-2535 Diamonds standard.

## Briefly about the task

1. ContractAFacet includes getter and setter function to read and write the value.
2. ContractAUpgradeFacet is the upgraded facet from ContractAFacet and ContractBFacet (which contains Access Control)
3. The addresses/accounts which have `MANAGER` role can set/update the value.

## Installation

1. Clone this repo:
```console
git clone https://github.com/rajeebkm/diamond-3-hardhat.git
```

2. Install NPM packages:
```console
cd diamond-3-hardhat
npm install
```

## Run the hardhat node for local development

```console
npx hardhat node
```
## Compile Contracts

```console
npx hardhat compile
```

```
Compiling 27 files with 0.8.6
Compilation finished successfully

```

## Deployment

```console
npx hardhat run scripts/deploy.js  --network localhost
```

```
DiamondCutFacet deployed: 0x0165878A594ca255338adfa4d48449f69242Eb8F
Diamond deployed: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
DiamondInit deployed: 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6

Deploying facets
DiamondLoupeFacet deployed: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
ContractAFacet deployed: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788

```

### How the scripts/deploy.js script works

1. DiamondCutFacet is deployed.
1. The diamond is deployed, passing as arguments to the diamond constructor the owner address of the diamond and the DiamondCutFacet address. DiamondCutFacet has the `diamondCut` external function which is used to upgrade the diamond to add more functions.
1. The `DiamondInit` contract is deployed. This contains an `init` function which is called on the first diamond upgrade to initialize state of some state variables. Information on how the `diamondCut` function works is here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface
1. Facets are deployed. (ContractAFacet, ContractAUpgradedFacet)
1. The diamond is upgraded. The `diamondCut` function is used to add functions from facets  to the diamond. In addition the `diamondCut` function calls the `init` function from the `DiamondInit` contract using `delegatecall` to initialize state variables.

## Upograde

```console
npx hardhat run scripts/upgrade.js --network localhost
```

```
Deploying facets
ContractAUpgradeFacet deployed: 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0

```

## Run tests:
```console
npx hardhat test
```

## Upgrade a diamond

Check the `scripts/deploy.js`, `scripts/upgrade.js` and or the `test/diamondTest.js` file for deploy and upgrades.

Note that upgrade functionality is optional. It is possible to deploy a diamond that can't be upgraded, which is a 'Single Cut Diamond'.  It is also possible to deploy an upgradeable diamond and at a later date remove its `diamondCut` function so it can't be upgraded any more.

Note that any number of functions from any number of facets can be added/replaced/removed on a diamond in a single transaction. In addition an initialization function can be executed in the same transaction as an upgrade to initialize any state variables required for an upgrade. This 'everything done in a single transaction' capability ensures a diamond maintains a correct and consistent state during upgrades.

## Facet Information

The `contracts/Diamond.sol` file shows an example of implementing a diamond.

The `contracts/facets/DiamondCutFacet.sol` file shows how to implement the `diamondCut` external function.

The `contracts/facets/DiamondLoupeFacet.sol` file shows how to implement the four standard loupe functions.

The `contracts/libraries/LibDiamond.sol` file shows how to implement Diamond Storage and a `diamondCut` internal function.

The `scripts/deploy.js` file shows how to deploy a diamond.

The `scripts/upgrade.js` file shows how to deploy a diamond.

The `test/diamondTest.js` file gives tests for the `diamondCut` function and the Diamond Loupe functions.

## How to Get Started Making Your Diamond

1. Reading and understand [EIP-2535 Diamonds](https://github.com/ethereum/EIPs/issues/2535). If something is unclear let me know!

2. Use a diamond reference implementation. You are at the right place because this is the README for a diamond reference implementation.

This diamond implementation is boilerplate code that makes a diamond compliant with EIP-2535 Diamonds.

Specifically you can copy and use the [DiamondCutFacet.sol](./contracts/facets/DiamondCutFacet.sol) and [DiamondLoupeFacet.sol](./contracts/facets/DiamondLoupeFacet.sol) contracts. They implement the `diamondCut` function and the loupe functions.

The [Diamond.sol](./contracts/Diamond.sol) contract could be used as is, or it could be used as a starting point and customized. This contract is the diamond. Its deployment creates a diamond. It's address is a stable diamond address that does not change.

The [LibDiamond.sol](./contracts/libraries/LibDiamond.sol) library could be used as is. It shows how to implement Diamond Storage. This contract includes contract ownership which you might want to change if you want to implement DAO-based ownership or other form of contract ownership. Go for it. Diamonds can work with any kind of contract ownership strategy. This library contains an internal function version of `diamondCut` that can be used in the constructor of a diamond or other places.

## Calling Diamond Functions

In order to call a function that exists in a diamond you need to use the ABI information of the facet (example, ContractAUpgradeFacet ) that has the function.

Here is an example that uses ethers.js:

```javascript
const ContractAUpgradeFacet = await ethers.getContractAt(ContractAUpgradeFacet, diamondAddress);
```

In the code above we create a contract variable so we can call contract functions with it.

In this example we know we will use a diamond because we pass a diamond's address as the second argument. But we are using an ABI from the ContractAUpgradeFacet facet so we can call functions that are defined in that facet. ContractAUpgradeFacet's functions must have been added to the diamond (using diamondCut) in order for the diamond to use the function information provided by the ABI of course.




## Useful Links
1. [Introduction to the Diamond Standard, EIP-2535 Diamonds](https://eip2535diamonds.substack.com/p/introduction-to-the-diamond-standard)
1. [EIP-2535 Diamonds](https://github.com/ethereum/EIPs/issues/2535)
1. [Understanding Diamonds on Ethereum](https://dev.to/mudgen/understanding-diamonds-on-ethereum-1fb)
1. [Solidity Storage Layout For Proxy Contracts and Diamonds](https://medium.com/1milliondevs/solidity-storage-layout-for-proxy-contracts-and-diamonds-c4f009b6903)
1. [New Storage Layout For Proxy Contracts and Diamonds](https://medium.com/1milliondevs/new-storage-layout-for-proxy-contracts-and-diamonds-98d01d0eadb)
1. [Upgradeable smart contracts using the Diamond Standard](https://hiddentao.com/archives/2020/05/28/upgradeable-smart-contracts-using-diamond-standard)
1. [buidler-deploy supports diamonds](https://github.com/wighawag/buidler-deploy/)

## Author

This example implementation was written by Rajeeb Kumar Malik.

Contact:

- rajeebk.malik@gmail.com

## License

MIT license. See the license file.
Anyone can use or modify this software for their purposes.

