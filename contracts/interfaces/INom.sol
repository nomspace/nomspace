// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// NOTE: Name == Nom in the documentation and is used interchangeably
interface INom {
  // @dev Reserve a Nom for a duration of time
  // @param name The name to reserve
  // @param durationToReserve The length of time in seconds to reserve this name
  function reserve(bytes32 name, uint256 durationToReserve) external;

  // @dev Extend a Nom reservation
  // @param name The name to extend the reservation of
  // @param durationToExtend The length of time in seconds to extend
  function extend(bytes32 name, uint256 durationToExtend) external;

  // @dev Retrieve the address that a Nom points to
  // @param name The name to resolve
  // @returns resolution The address that the Nom points to
  function resolve(bytes32 name) external view returns (address resolution);

  // @dev Get the expiration timestamp of a Nom 
  // @param name The name to get the expiration of
  // @returns expiration Time in seconds from epoch that this Nom expires
  function expirations(bytes32 name) external view returns (uint256 expiration);

  // @dev Change the resolution of a Nom
  // @param name The name to change the resolution of
  // @param newResolution The new address that should be pointed to
  function changeResolution(bytes32 name, address newResolution) external;

  // @dev Retrieve the owner of a Nom
  // @param name The name to find the owner of
  // @returns owner The address that owns the Nom
  function nameOwner(bytes32 name) external view returns (address owner);

  // @dev Change the owner of a Nom
  // @param name The name to change the owner of
  // @param newOwner The new owner
  function changeNameOwner(bytes32 name, address newOwner) external;

  // @dev Check whether a Nom is expired
  // @param name The name to check the expiration of
  // @param expired Flag indicating whether this Nom is expired
  function isExpired(bytes32 name) external view returns (bool expired);
}

