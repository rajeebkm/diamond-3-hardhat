// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../libraries/ContractAAppStorage.sol";

contract ContractAFacet is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    ContractAAppStorage internal s;
    // uint256 public value;

    function initialize(uint256 _newValue) public initializer {
        // __Context_init_unchained();
        __ReentrancyGuard_init();
        __Ownable_init();
        s.value = _newValue;
    }

    function set(uint256 _value) public virtual onlyOwner nonReentrant {
        s.value += _value;
    }

    function get() public view virtual returns (uint){
        return s.value;
    }

    // function getSelector(string calldata _func) external pure returns (bytes4) {
    //     return bytes4(keccak256(bytes(_func)));
    // }
}