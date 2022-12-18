// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;



import { ContractAFacet } from "./ContractAFacet.sol";
// import { AccessRegistry } from "../AccessRegistry.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IAccessRegistry } from "../interfaces/IAccessRegistry.sol";

contract ContractAUpgradeFacet is ContractAFacet {

    // function initialize() public virtual override initializer {
    //     AppStorage storage ds = LibCommon.diamondStorage();
    //     ds.MANAGER_ROLE = keccak256("MANAGER");
    //     addAdminRole(ds.MANAGER_ROLE, _msgSender());
    //     addRole(ds.MANAGER_ROLE, _msgSender());
    //     // addAdminRole(MANAGER_ROLE, address(this));
        
    // }


    
    
    function set(uint256 _newValue) public virtual override nonReentrant {
        
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
         require(
            IAccessRegistry(ds.superAdminAddress).hasAdminRole(ds.superAdmin, _msgSender()) ||
                IAccessRegistry(ds.superAdminAddress).hasAdminRole(ds.MANAGER_ROLE, _msgSender()),
            "ERROR: Not an admin"
        );
        // require(hasAdminRole(ds.MANAGER_ROLE, _msgSender()), 'Only Manager can call this');
        // require(hasAdminRole(ds.superAdmin, _msgSender()), 'Only Manager can call this');
        LibDiamond._updatevalue(_newValue);
        emit LibDiamond.ValueUpdated(_newValue);
    }


}
