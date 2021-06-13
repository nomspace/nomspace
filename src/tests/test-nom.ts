import {use} from 'chai'
import chaiAsPromised from 'chai-as-promised'
use(require('bn-chai'))
use(chaiAsPromised)
require('chai').should()

import {NomKit} from "../nomkit"
import {newKit} from "@celo/contractkit"
import {NomInstance, FeeModuleV0Instance, FeeModuleV1Instance, MockERC20Instance} from "../../types/truffle-contracts";
const Nom = artifacts.require("Nom");
const MockERC20 = artifacts.require("MockERC20");
const FeeModuleV0 = artifacts.require("FeeModuleV0");
const FeeModuleV1 = artifacts.require("FeeModuleV1");

const kit = newKit("http://127.0.0.1:7545")
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const ONE_DAY = 1000 * 60 * 60 * 24
const NAME = "nomspace";
const NAME2 = "nomspace2";

contract("Nom", async (accounts) => {
  let mockERC20: MockERC20Instance;
  let feeModule: FeeModuleV0Instance;
  let feeModule1: FeeModuleV1Instance;
  let nom: NomInstance;
  let nomKit: NomKit;

  const alice = accounts[0];
  const bob = accounts[1];
  const treasury = accounts[2];

  before(async () => {
    mockERC20 = await MockERC20.new(100);
    feeModule = await FeeModuleV0.new(); nom = await Nom.new(feeModule.address);
    feeModule1 = await FeeModuleV1.new(mockERC20.address, 1, treasury);
    nom = await Nom.new(feeModule.address);
    nomKit = new NomKit(kit, nom.address)
  })

  describe("#reserve", () => {
    it("should work", async () => {
      (await nomKit.nameOwner(NAME)).should.be.equal(ZERO_ADDRESS);
      const now = Math.floor(Date.now() / 1000)
      await nomKit.reserve(NAME, ONE_DAY).send({from: alice});
      (await nomKit.expiration(NAME)).should.be.gte(now + ONE_DAY);
      (await nomKit.nameOwner(NAME)).should.be.equal(alice);
    })

    it("should revert when trying to reserve a reserved name", async () => {
      (await nomKit.nameOwner(NAME)).should.be.equal(alice);

      await nomKit.reserve(NAME, ONE_DAY).send({from: bob}).should.be.rejectedWith("Cannot reserve a name that has not expired");

      (await nomKit.nameOwner(NAME)).should.be.equal(alice);
    })
  })

  describe("#extend", () => {
    it("should revert when trying to extend an expired name", async () => {
      await nomKit.extend("random", ONE_DAY).send({from: bob}).should.be.rejectedWith("Cannot extend the reservation of a name that has expired");
    })

    it("should revert when trying to extend from a non-owner", async () => {
      await nomKit.extend(NAME, ONE_DAY).send({from: bob}).should.be.rejectedWith("Caller is not the owner of this name");
    })

    it("should work", async () => {
      const currentExpiration = await nomKit.expiration(NAME)
      await nomKit.extend(NAME, ONE_DAY).send({from: alice});
      (await nomKit.expiration(NAME)).should.be.gte(currentExpiration + ONE_DAY);
    })
  })

  describe("resolutions", () => {
    it("should resolve to the ZERO_ADDRESS by default", async () => {
      (await nomKit.resolve("random")).should.be.equal(ZERO_ADDRESS);
      (await nomKit.resolve(NAME)).should.be.equal(ZERO_ADDRESS);
    })

    it("should revert when changing resolution of an expired name", async () => {
      await nomKit.changeResolution("random", bob).send({from: bob}).should.be.rejectedWith("Cannot change resolution of an expired name");
    })

    it("should revert when changing resolution from a non-owner", async () => {
      await nomKit.changeResolution(NAME, bob).send({from: bob}).should.be.rejectedWith("Caller is not the owner of this name");
    })

    it("should work", async () => {
      await nomKit.changeResolution(NAME, alice).send({from: alice});
      (await nomKit.resolve(NAME)).should.be.equal(alice);
    })
  })

  describe("owners", () => {
    it("should resolve to the ZERO_ADDRESS by default", async () => {
      (await nomKit.nameOwner("random")).should.be.equal(ZERO_ADDRESS);
    })

    it("should revert when changing owner of an expired name", async () => {
      await nomKit.changeNameOwner("random", bob).send({from: bob}).should.be.rejectedWith("Cannot change owner of an expired name");
    })

    it("should revert when changing owner from a non-owner", async () => {
      await nomKit.changeNameOwner(NAME, bob).send({from: bob}).should.be.rejectedWith("Caller is not the owner of this name");
    })

    it("should work", async () => {
      (await nomKit.nameOwner(NAME)).should.be.equal(alice);
      await nomKit.changeNameOwner(NAME, bob).send({from: alice});
      (await nomKit.nameOwner(NAME)).should.be.equal(bob);
    })
  })

  describe("feeModule", () => {
    it("should fail if called by a non contract owner", async () => {
      await nomKit.setFeeModule(feeModule1.address).send({from: bob}).should.be.rejectedWith("Ownable: caller is not the owner");
    })

    it("should work", async () => {
      await nomKit.setFeeModule(feeModule1.address).send({from: alice});
      (await nomKit.feeModule()).should.be.equal(feeModule1.address)
    })
  })

  describe("FeeModulev1", async () => {
    it("should fail if user has no funds", async () => {
      await nomKit.reserve("random", 100).send({from: bob}).should.be.rejectedWith("ERC20: transfer amount exceeds balance");
    })

    it("should fail if there's no approval", async () => {
      await nomKit.reserve(NAME2, 100).send({from: alice}).should.be.rejectedWith("ERC20: transfer amount exceeds allowance");
    })

    it("should work if user has funds", async () => {
      await mockERC20.approve(feeModule1.address, 100)
      const now = Math.floor(Date.now() / 1000)
      await nomKit.reserve(NAME2, 100).send({from: alice});
      (await nomKit.expiration(NAME2)).should.be.gte(now + 100);
      (await nomKit.nameOwner(NAME2)).should.be.equal(alice);
      (await mockERC20.balanceOf(alice)).toString().should.be.eq("0")
    })
  })
})

