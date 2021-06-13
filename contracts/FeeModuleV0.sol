// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IFeeModule.sol";

contract FeeModuleV0 is IFeeModule {
  // @dev A pay function that doesn't require payment
  function pay(address, uint256) override external pure returns (bool success) {
    return true;
  }
}

