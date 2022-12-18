// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import { IAccessRegistry } from "./interfaces/IAccessRegistry.sol";
import { Pausable } from "./utils/Pausable.sol";

/**
 * structure, for storing accounts of various roles
 */
struct RoleData {
    mapping(address => bool) _members;
}

/**
 * structure, for storing addresses of admin of various facets
 */
struct AdminRoleData {
    mapping(address => bool) _adminMembers;
}

/**
 * @title contract AccessRegistry
 */
contract AccessRegistry is Pausable, IAccessRegistry {
    mapping(bytes32 => RoleData) roles;
    mapping(bytes32 => AdminRoleData) adminRoles;
    bytes32 superAdmin;
    bytes32 MANAGER_ROLE;
    

    /**
     * @dev emits when entry is set.
     */
    event AdminRoleDataGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event AdminRoleDataRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev The contract has an owner address, and provides basic authorization control
     * constructor, for initializing contract with upgrade admin
     */
    constructor(address upgradeAdmin) {
        superAdmin = 0x41636365737352656769737472792e61646d696e000000000000000000000000;
        MANAGER_ROLE = keccak256("MANAGER");
        adminRoles[superAdmin]._adminMembers[upgradeAdmin] = true;
        adminRoles[MANAGER_ROLE]._adminMembers[upgradeAdmin] = true;

        addAdminRole(superAdmin, address(this));
        addAdminRole(MANAGER_ROLE, address(this));
    }

    /**
     * @dev checks for the role of the account
     * @param role - account role
     * @param account - account for the role
     */
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return roles[role]._members[account];
    }

    /**
     * @dev assigns role to the account
     * @param role - account role
     * @param account - account for the role
     */
    function addRole(bytes32 role, address account) public override nonReentrant onlyAdmin {
        require(!hasRole(role, account), "Role already exists. Please create a different role");
        roles[role]._members[account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    /**
     * @dev only admin can revoke the role of an account
     * @param role - account role
     * @param account - account for the role
     */
    function removeRole(bytes32 role, address account) external override nonReentrant onlyAdmin {
        require(hasRole(role, account), "Role does not exist.");
        revokeRole(role, account);
    }

    /**
     * @dev give up the role of the account
     * @param role - account role
     * @param account - account for the role
     */
    function renounceRole(bytes32 role, address account) external override nonReentrant {
        require(hasRole(role, account), "Role does not exist.");
        require(_msgSender() == account, "Inadequate permissions");
        revokeRole(role, account);
    }

    /**
     * @dev revokes role of the account
     * @param role - account role
     * @param account - account for the role
     */
    function revokeRole(bytes32 role, address account) private {
        roles[role]._members[account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    /**
     * @dev transfers role of an account
     * @param role - account role
     * @param oldAccount - role transfer from account
     * @param newAccount - role transfer to account
     */
    function transferRole(
        bytes32 role,
        address oldAccount,
        address newAccount
    ) external override nonReentrant {
        require(hasRole(role, oldAccount) && _msgSender() == oldAccount, "Role does not exist.");
        revokeRole(role, oldAccount);
        addRole(role, newAccount);
    }

    /**
     * @dev checks the admin role for the account
     * @param role - account role
     * @param account - account for the role
     */
    function hasAdminRole(bytes32 role, address account) public view override returns (bool) {
        return adminRoles[role]._adminMembers[account];
    }

    /**
     * @dev only admin can assigns admin role to the account
     * @param role - account role
     * @param account - account for the role
     */
    function addAdminRole(bytes32 role, address account) public override nonReentrant onlyAdmin {
        require(!hasAdminRole(role, account), "Role already exists. Please create a different role");
        adminRoles[role]._adminMembers[account] = true;
        emit AdminRoleDataGranted(role, account, msg.sender);
    }

    /**
     * @dev only admin can remove admin role from an account
     * @param role - account role
     * @param account - account for the role
     */
    function removeAdminRole(bytes32 role, address account) external override nonReentrant onlyAdmin {
        require(hasAdminRole(role, account), "Role does not exist.");
        revokeAdmin(role, account);
    }

    /**
     * @dev revokes admin role from an account
     * @param role - account role
     * @param account - account for the role
     */
    function revokeAdmin(bytes32 role, address account) private {
        adminRoles[role]._adminMembers[account] = false;
        emit AdminRoleDataRevoked(role, account, msg.sender);
    }

    /**
     * @dev only admin can transfer role
     * @param role - account role
     * @param oldAccount - role transfer from account
     * @param newAccount - role transfer to account
     */
    function adminRoleTransfer(
        bytes32 role,
        address oldAccount,
        address newAccount
    ) external override nonReentrant onlyAdmin {
        require(hasAdminRole(role, oldAccount), "Role already exists. Please create a different role");
        revokeAdmin(role, oldAccount);
        addAdminRole(role, newAccount);
    }

    /**
     * @dev only admin can renounce admin role from an account
     * @param role - account role
     * @param account - account for the role
     */
    function adminRoleRenounce(bytes32 role, address account) external override nonReentrant onlyAdmin {
        require(hasAdminRole(role, account), "Role does not exist.");
        require(_msgSender() == account, "Inadequate permissions");
        revokeAdmin(role, account);
    }

    /**
     * @dev Throws if called by any account other than the admin
     */
    modifier onlyAdmin() {
        require(hasAdminRole(superAdmin, _msgSender()), "ERROR: Not an admin");
        _;
    }

    /**
     * @dev only admin can pause
     */
    function pauseAccessRegistry() external override onlyAdmin {
        _pause();
    }

    /**
     * @dev only admin can unpause
     */
    function unpauseAccessRegistry() external override onlyAdmin {
        _unpause();
    }

    /**
     * @dev returns the pause state
     */
    function isPausedAccessRegistry() external view virtual override returns (bool) {
        return _paused();
    }
}