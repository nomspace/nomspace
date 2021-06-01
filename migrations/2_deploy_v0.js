const FeeModuleV0 = artifacts.require("FeeModuleV0");
const Nom = artifacts.require("Nom");

module.exports = function (deployer) {
  return deployer.then(async () => {
    const feeModule = await deployer.deploy(FeeModuleV0);
    await deployer.deploy(Nom, feeModule.address);
  })
};

