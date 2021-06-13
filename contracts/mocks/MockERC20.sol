// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
  constructor(uint256 toMint) ERC20("MockERC20", "M") {
    _mint(_msgSender(), toMint);
  }
}

