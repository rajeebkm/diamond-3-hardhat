/* global ethers */
/* eslint prefer-const: "off" */

const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function deployDiamond() {
  const diamond = "0x21915b79E1d334499272521a3508061354D13FF0";
  // const diamondInit = "0x3aAde2dCD2Df6a8cAc689EE797591b2913658659"
  // const diamondCut = "0x976fcd02f7C4773dd89C309fBF55D5923B4c98a1"
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  // const diamondInit = await ethers.getContractAt("DiamondInit", diamond)
  // await diamondInit.deployed()
  // console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = [
    // 'ContractAFacet',
    // 'ContractBFacet',
    "ContractAUpgradeFacet",
  ];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    // const Facet = await ethers.getContractAt('FacetName', diamondAddress)
    // const functionsToKeep = ['()']
    // const selectors = getSelectors(Facet).remove(functionsToKeep)
    const selectors = getSelectors(facet).remove(["supportsInterface(bytes4)"]);
    console.log("ContractAUpgradeSelectors", selectors);
    cut.push(
      {
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: [
          "0xa217fddf",
          "0x78357e53",
          "0xe959b38a",
          "0x248a9ca3",
          "0x2f2ff15d",
          "0x91d14854",
          "0x8a66a962",
          "0x72176357",
          "0x36568abe",
          "0xd547741f",
        ],
      },
      {
        facetAddress: facet.address,
        action: FacetCutAction.Replace,
        functionSelectors: [
          "0x6d4ce63c",
          "0xfe4b84df",
          "0x8da5cb5b",
          "0x715018a6",
          "0x60fe47b1",
          "0xf2fde38b",
        ],
      }
    );
  }

  // ContractASelectors
  // '0x6d4ce63c',
  // '0xfe4b84df',
  // '0x8da5cb5b',
  // '0x715018a6',
  // '0x60fe47b1',
  // '0xf2fde38b',

  // ContractAUpgradeSelectors [
  //   '0xa217fddf',
  //   '0x78357e53',
  //   '0xe959b38a',
  //   '0x6d4ce63c',...
  //   '0x248a9ca3',
  //   '0x2f2ff15d',
  //   '0x91d14854',
  //   '0xfe4b84df',...
  //   '0x8da5cb5b',...
  //   '0x8a66a962',
  //   '0x72176357',
  //   '0x715018a6',...
  //   '0x36568abe',
  //   '0xd547741f',
  //   '0x60fe47b1',...
  //   '0xf2fde38b',...

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamond);
  // diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamond)
  console.log("diamondCut address", diamondCut.address);
  let tx;
  let receipt;
  // call to init function
  // let functionCall = diamondInit.interface.encodeFunctionData('init')
  tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, "0x");
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  const contractAUpgradeFacet = await ethers.getContractAt(
    "ContractAUpgradeFacet",
    diamond
  );
  console.log(await getSelectors(contractAUpgradeFacet))
  console.log("Completed diamond cut");
  return diamond.address;
}

//   const contractAFacet = await ethers.getContractAt("ContractAFacet", "0x4EE6eCAD1c2Dae9f525404De8555724e3c35d07B");
//   const val = await contractAFacet.value();
//   console.log(val);

// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
