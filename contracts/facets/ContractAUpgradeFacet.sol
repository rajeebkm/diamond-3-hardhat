// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./ContractAFacet.sol";
import "./ContractBFacet.sol";
// import "../libraries/ContractAAppStorage.sol";

contract ContractAUpgradeFacet is ContractAFacet, ContractBFacet {
    // ContractAAppStorage internal s;

    bytes32 public Manager = keccak256('MANAGER');
    
    function set(uint256 _value) public virtual override nonReentrant {
        require(hasRole(Manager, msg.sender), 'Only Manager can call this');
        s.value += _value;
    }


}