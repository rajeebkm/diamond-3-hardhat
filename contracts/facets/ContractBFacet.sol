// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// import "../libraries/ContractAAppStorage.sol";

contract ContractBFacet is AccessControlUpgradeable {
    // ContractAAppStorage internal s;

    function addRole(bytes32 role, address account) public {
        grantRole(role, account);
    }

    function removRole(bytes32 role, address account) public {
        revokeRole(role, account);
    }

    // function transferRole(bytes32 role, address account, address anotherAccount) public {
    //     require(account == _msgSender(), "AccessControl: can only renounce roles for self");
    //     _grantRole(role, anotherAccount);
    //     _revokeRole(role, account);
    // }

    function renounceAdminRole(bytes32 role, address account) public {
        renounceRole(role, account);
    }
    
}