// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// import { DiamondStorage, LibDiamond } from "../libraries/LibDiamond.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { Pausable } from "../utils/Pausable.sol";
import { IContractAFacet } from "../interfaces/IContractAFacet.sol";

contract ContractAFacet is Pausable, IContractAFacet {



    // function initialize() external virtual initializer {
    //     __Context_init();
    //     __Ownable_init();
    //     // LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    //     LibDiamond.setContractOwner(_msgSender());
    // }

    function set(uint256 _newValue) external virtual override onlyOwner nonReentrant {
        LibDiamond._updatevalue(_newValue);
        emit LibDiamond.ValueUpdated(_newValue);
    }

    function get() external view virtual override returns (uint){
        return LibDiamond._getValue();
    }

    // function getSelector(string calldata _func) external pure returns (bytes4) {
    //     return bytes4(keccak256(bytes(_func)));
    // }
}
