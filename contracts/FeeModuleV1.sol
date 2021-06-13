// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IFeeModule.sol";

contract FeeModuleV1 is IFeeModule, Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public currency;
  uint256 public paymentRate;
  address public treasury;

  event CurrencyChanged(address indexed previousCurrency, address indexed nextCurrency);
  event PaymentRateChanged(uint256 indexed previousPaymentRate, uint256 indexed nextPaymentRate);
  event TreasuryChanged(address indexed previousTreasury, address indexed nextTreasury);

  constructor(IERC20 currency_, uint256 paymentRate_, address treasury_) {
    currency = currency_;
    paymentRate = paymentRate_;
    treasury = treasury_;
  }

  // @dev Make a payment for a reservation. Payment is linear w.r.t duration
  // @param payer The address to pay for the reservation
  // @param durationToReserve The length of time in seconds to reserve
  // @returns success Whether the payment was sucessful
  function pay(address payer, uint256 durationToReserve) override external returns (bool success) {
    require(treasury != address(0), "Cannot pay while treasury points to the zero address");
    currency.safeTransferFrom(payer, treasury, durationToReserve.mul(paymentRate));
    return true;
  }

  function setCurrency(IERC20 currency_) external onlyOwner {
    IERC20 previousCurrency = currency;
    currency = currency_;
    emit CurrencyChanged(address(previousCurrency), address(currency));
  }

  function setPaymentRate(uint256 paymentRate_) external onlyOwner {
    uint256 previousPaymentRate = paymentRate;
    paymentRate = paymentRate_;
    emit PaymentRateChanged(previousPaymentRate, paymentRate);
  }

  function setTreasury(address treasury_) external onlyOwner {
    address previousTreasury = treasury;
    treasury = treasury_;
    emit TreasuryChanged(previousTreasury, treasury);
  }
}


