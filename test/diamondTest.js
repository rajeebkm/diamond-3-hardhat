/* global describe it before ethers */

const {
  getSelectors,
  FacetCutAction,
  removeSelectors,
  findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert, expect } = require('chai')
const keccak256 = require('keccak256')
const arrayBufferToHex = require('array-buffer-to-hex')

describe('DiamondTest', async function () {
  let diamondAddress
  let diamondCutFacet
  let diamondLoupeFacet
  // let ownershipFacet
  let contractAFacet
  let contractAUpgradeFacet
  let tx
  let receipt
  let result
  let owner
  let addr1
  let addr2
  const addresses = []

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    diamondAddress = await deployDiamond()
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
    contractAFacet = await ethers.getContractAt('ContractAFacet', diamondAddress)
    // console.log(parseInt(await contractAFacet.value())) // 0
  })

  it('should have three facets -- call to facetAddresses function', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address)
    }
    assert.equal(addresses.length, 3)
    console.log(addresses)
  })

  it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
    let selectors = getSelectors(diamondCutFacet)
    // console.log(selectors)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
    // console.log(result)
    assert.sameMembers(result, selectors)
    selectors = getSelectors(diamondLoupeFacet)
    // console.log(selectors)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
    // console.log(result)
    assert.sameMembers(result, selectors)
    selectors = getSelectors(contractAFacet)
    // console.log(selectors)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
    assert.sameMembers(result, selectors)
  })

  it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
    assert.equal(
      addresses[0],
      await diamondLoupeFacet.facetAddress('0x1f931c1c')
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0xcdffacc6')
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0x01ffc9a7')
    )
    assert.equal(
      addresses[2],
      await diamondLoupeFacet.facetAddress('0xf2fde38b')
    )
  })

  it('should add ContractAUpgradeFacet functions', async () => {
    const ContractAUpgradeFacet = await ethers.getContractFactory('ContractAUpgradeFacet')
    contractAUpgradeFacet = await ContractAUpgradeFacet.deploy()
    await contractAUpgradeFacet.deployed()
    addresses.push(contractAUpgradeFacet.address)
    console.log(addresses)
    console.log('Facet addresses: ', await diamondLoupeFacet.facetAddresses())
    const selectors = getSelectors(contractAUpgradeFacet).remove(['supportsInterface(bytes4)'])
    tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: contractAUpgradeFacet.address,
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
        facetAddress: contractAUpgradeFacet.address,
        action: FacetCutAction.Replace,
        functionSelectors: [
          "0x6d4ce63c",
          "0xfe4b84df",
          "0x8da5cb5b",
          "0x715018a6",
          "0x60fe47b1",
          "0xf2fde38b",
        ],
      }],
      ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    result = await diamondLoupeFacet.facetFunctionSelectors(contractAUpgradeFacet.address)
    assert.sameMembers(result, selectors)
    console.log('Facet addresses after upgrade: ', await diamondLoupeFacet.facetAddresses())
  })

  it('should test function call', async () => {
    const contractAFacet = await ethers.getContractAt('ContractAFacet', diamondAddress)
    await contractAFacet.get()
  })

  it('should check facets and selectors', async () => {
    const facets = await diamondLoupeFacet.facets()
    const facetAddresses = await diamondLoupeFacet.facetAddresses()
    console.log(facets)
    console.log(facetAddresses)
    console.log(addresses)
    console.log(getSelectors(contractAUpgradeFacet).remove(['supportsInterface(bytes4)']))
    console.log(facets[findAddressPositionInFacets(addresses[3], facets)][1])
    assert.equal(facetAddresses.length, 3)
    assert.equal(facets.length, 3)
    // assert.sameMembers(facetAddresses, addresses)
    assert.equal(facets[0][0], facetAddresses[0], 'first facet')
    assert.equal(facets[1][0], facetAddresses[1], 'second facet')
    assert.equal(facets[2][0], facetAddresses[2], 'third facet')
    assert.sameMembers(facets[findAddressPositionInFacets(addresses[0], facets)][1], getSelectors(diamondCutFacet))
    assert.sameMembers(facets[findAddressPositionInFacets(addresses[1], facets)][1], getSelectors(diamondLoupeFacet))
    assert.sameMembers(facets[findAddressPositionInFacets(addresses[3], facets)][1], getSelectors(contractAUpgradeFacet).remove(['supportsInterface(bytes4)']))
  })

  it('should pass if caller is the Manager', async () => {
    const contractAUpgradeFacet = await ethers.getContractAt('ContractAUpgradeFacet', diamondAddress)
    const value = await contractAUpgradeFacet.get()
    console.log("Initial Value: ", parseInt(value)) //0
    let Manager = keccak256('MANAGER')
    await contractAUpgradeFacet.grantRole(arrayBufferToHex(Manager), owner.address)
    const newValue = await contractAUpgradeFacet.set(10)
    console.log("New Value: ", parseInt(newValue))
    console.log("contract Owner", owner.address)
    // await diamondAddress.connect(contractOwner.address).set(10)
  })


  it('should fail if caller is not the Manager', async () => {
    const contractAUpgradeFacet = await ethers.getContractAt('ContractAUpgradeFacet', diamondAddress)
    const value = await contractAUpgradeFacet.get()
    console.log("Initial Value: ", parseInt(value))
    console.log("another account", addr1.address)
    await expect (contractAFacet.connect(addr1.address).set(10)).to.be.revertedWith('Only Manager can call this')
  })

 

})

