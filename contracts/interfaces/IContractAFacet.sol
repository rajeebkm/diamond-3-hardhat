// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IContractAFacet {

    function set(uint256 _newValue) external;
    
    function get() external view returns (uint256);
    

}