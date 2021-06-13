require('dotenv').config()
const FeeModuleV1 = artifacts.require("FeeModuleV1");
const Nom = artifacts.require("Nom");

module.exports = function (deployer, network) {
  return deployer.then(async () => {
    let feeModule;
    if (network === 'alfajores') {
      feeModule = await deployer.deploy(
        FeeModuleV1,
        "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
        100000000000,
        process.env.TREASURY,
      );
    } else {
      feeModule = await deployer.deploy(
        FeeModuleV1,
        "0x471ece3750da237f93b8e339c536989b8978a438",
        100000000000,
        process.env.TREASURY,
      );
    }
    const nom = await Nom.deployed()
    await nom.setFeeModule(feeModule.address)
  })
};
