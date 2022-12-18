// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LibDiamond.sol";

library LibContractA {

   

    event ValueUpdated(uint256 newValue);

    function _getValue() internal view returns (uint256) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        return ds.value;
    }

    function _updatevalue(
        uint256 _newValue
    ) internal {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        LibDiamond.DiamondStorage storage updateValue = ds;
        updateValue.value += _newValue;
        emit ValueUpdated(_newValue);
    }
}