/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
    const diamondAddress = "0xD855cE0C298537ad5b5b96060Cf90e663696bbf6";
    const accounts = await ethers.getSigners()
    const contractOwner = accounts[0]
//   // const accounts = await ethers.getSigners();
//   // const upgradeAdmin = accounts[0];

//   // deploy DiamondCutFacet
//   const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
//   const diamondCutFacet = await DiamondCutFacet.deploy()
//   await diamondCutFacet.deployed()
//   console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

//   // deploy Diamond
//   const Diamond = await ethers.getContractFactory('Diamond')
//   const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacet.address)
//   await diamond.deployed()
//   console.log('Diamond deployed:', diamond.address)

//   // deploy DiamondInit
//   // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
//   // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
//   const DiamondInit = await ethers.getContractFactory('DiamondInit')
//   const diamondInit = await DiamondInit.deploy()
//   await diamondInit.deployed()
//   console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  console.log('')
  console.log('Deploying facets')
  const FacetNames = [
    // 'DiamondLoupeFacet',
    'ContractAUpgradeFacet'
  ]
  const cut = []
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    console.log(`${FacetName} deployed: ${facet.address}`)
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Replace,
      functionSelectors: getSelectors(facet)
    })
  }


//   /// DEPLOY ACCESS_REGISTRY
//   const AccessRegistry = await ethers.getContractFactory("AccessRegistry");
//   const accessRegistry = await AccessRegistry.deploy(contractOwner.address);
//   const accessRegistryAddress = accessRegistry.address;
//   console.log("AccessRegistry deployed at ", accessRegistry.address);

  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress)
//   let args = [];
//   args.push(contractOwner.address);
//   args.push(accessRegistryAddress);
//   console.log("args below::");
//   console.log(args);
  // call to init function
//   let functionCall = diamondInit.interface.encodeFunctionData("init", args);
  tx = await diamondCut.diamondCut(cut, "0x0000000000000000000000000000000000000000", []);
  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')

  const ContractAUpgradeFacet = await ethers.getContractAt("ContractAUpgradeFacet", diamondAddress)
  const getValue = await ContractAUpgradeFacet.get();
  console.log("Get Value: ", parseInt(getValue));
  await ContractAUpgradeFacet.set(25);
  const getValue2 = await ContractAUpgradeFacet.get();
  console.log("Get Value: ", parseInt(getValue2));
  await ContractAUpgradeFacet.connect(accounts[0]).set(50);
  const getValue3 = await ContractAUpgradeFacet.get();
  console.log("Get Value: ", parseInt(getValue3));
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond
