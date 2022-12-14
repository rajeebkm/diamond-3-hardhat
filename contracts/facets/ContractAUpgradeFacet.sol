// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./ContractAFacet.sol";
import "./ContractBFacet.sol";
// import "../libraries/ContractAAppStorage.sol";

contract ContractAUpgradeFacet is ContractAFacet, ContractBFacet {
    // ContractAAppStorage internal s;

    bytes32 public MANAGER_ROLE = keccak256("MANAGER");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);

    }
    
    function set(uint256 _value) public virtual override onlyOwner nonReentrant {
        require(hasRole(MANAGER_ROLE, msg.sender), 'Only Manager can call this');
        s.value += _value;
    }


}