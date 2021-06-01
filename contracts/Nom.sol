// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IFeeModule.sol";

// NOTE: Name == Nom in the documentation and is used interchangeably
contract Nom is Ownable {
	using SafeMath for uint256;

  // @dev Each name's expiration timestamp
  mapping (bytes32 => uint256) public expirations;
  // @dev The upgradeable fee module for purchasing Noms
  IFeeModule feeModule;
  // @dev Each name's resolution
  mapping (bytes32 => address) private resolutions;
  // @dev Each name's owner
  mapping (bytes32 => address) private owners;

	// @dev emitted when a Nom's ownership has changed
	// @param name The name whose owner changed
	// @param previousOwner The previous owner
	// @param newOwner The new owner
  event NameOwnerChanged(bytes32 indexed name, address indexed previousOwner, address indexed newOwner);
	// @dev emitted when a Nom's resolution has changed
	// @param name The name whose resolution changed
	// @param previousResolution The previous resolution
	// @param newResolution The new resolution
  event NameResolutionChanged(bytes32 indexed name, address indexed previousResolution, address indexed newResolution);
	// @dev emitted when Nom's fee module changes
	// @param previousFeeModule Address of the previous feeModule
	// @param newFeeModule Address of the new feeModule
  event FeeModuleChanged(address indexed previousFeeModule, address indexed newFeeModule);

  constructor(IFeeModule _feeModule) {
    feeModule = _feeModule;
  }

  // @dev Reserve a Nom for a duration of time
  // @param name The name to reserve
  // @param durationToReserve The length of time in seconds to reserve this name
  function reserve(bytes32 name, uint256 durationToReserve) external {
    require(isExpired(name), "Cannot reserve a name that has not expired");
    bool paid = feeModule.pay(durationToReserve);
    require(paid, "Failed to pay for the name");

    uint256 currentTime = block.timestamp;
    address previousOwner = owners[name]; owners[name] = _msgSender();
    expirations[name] = currentTime.add(durationToReserve);
    resolutions[name] = address(0);
    emit NameOwnerChanged(name, previousOwner, owners[name]);
  }

  // @dev Extend a Nom reservation
  // @param name The name to extend the reservation of
  // @param durationToExtend The length of time in seconds to extend
  function extend(bytes32 name, uint256 durationToExtend) external {
    require(!isExpired(name), "Cannot extend the reservation of a name that has expired");
    require(_msgSender() == owners[name], "Caller is not the owner of this name");
    bool paid = feeModule.pay(durationToExtend);
    require(paid, "Failed to pay for the name");

    uint256 currentExpiration = expirations[name];
    expirations[name] = currentExpiration.add(durationToExtend);
  }

  // @dev Retrieve the address that a Nom points to
  // @param name The name to resolve
  // @returns resolution The address that the Nom points to
  function resolve(bytes32 name) external view returns (address resolution) {
    if (isExpired(name)) {
      return address(0);
    }

    return resolutions[name];
  }

  // @dev Change the resolution of a Nom
  // @param name The name to change the resolution of
  // @param newResolution The new address that should be pointed to
  function changeResolution(bytes32 name, address newResolution) external {
    require(!isExpired(name), "Cannot change resolution of an expired name");
    require(_msgSender() == owners[name], "Caller is not the owner of this name");

    address previousResolution = resolutions[name];
    resolutions[name] = newResolution;
    emit NameResolutionChanged(name, previousResolution, resolutions[name]);
  }

  // @dev Retrieve the owner of a Nom
  // @param name The name to find the owner of
  // @returns owner The address that owns the Nom
  function nameOwner(bytes32 name) external view returns (address owner) {
    if (isExpired(name)) {
      return address(0);
    }

    return owners[name];
  }

  // @dev Change the owner of a Nom
  // @param name The name to change the owner of
  // @param newOwner The new owner
  function changeNameOwner(bytes32 name, address newOwner) external {
    require(!isExpired(name), "Cannot change owner of an expired name");
    require(_msgSender() == owners[name], "Caller is not the owner of this name");

    address previousOwner = owners[name];
    owners[name] = newOwner;
    emit NameOwnerChanged(name, previousOwner, owners[name]);
  }

  // @dev Change the owner of a Nom
  // @param name The name to change the owner of
  // @param newOwner The new owner
  function setFeeModule(IFeeModule newFeeModule) onlyOwner external {
    IFeeModule previousFeeModule = feeModule;
    feeModule = newFeeModule;
    emit FeeModuleChanged(address(previousFeeModule), address(feeModule));
  }

  function isExpired(bytes32 name) public view returns (bool expired) {
    uint256 currentTime = block.timestamp;
    return currentTime > expirations[name];
  }
}
