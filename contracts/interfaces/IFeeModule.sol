// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFeeModule {
  // @dev Make a payment for a reservation
  // @param durationToReserve The length of time in seconds to reserve
  // @returns success Whether the payment was sucessful
  function pay(uint256 durationToReserve) external returns (bool success);
}

