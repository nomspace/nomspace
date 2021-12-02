import { Address, ContractKit } from "@celo/contractkit";
import { toTransactionObject } from "@celo/connect";
import { utils } from "ethers";

import { Nom, ABI } from "../types/web3-v1-contracts/Nom";

const GENESIS_BLOCK = 7240250;

/**
 * NomKit provides wrappers to interact with Nom contract.
 */
export class NomKit {
  public readonly contract: Nom;

  constructor(
    private kit: ContractKit,
    public readonly contractAddress: Address
  ) {
    this.contract = new kit.web3.eth.Contract(
      ABI,
      contractAddress
    ) as unknown as Nom;
  }

  public reserve = (name: string, durationToReserve: number) => {
    const bytes = utils.formatBytes32String(name);
    const txo = this.contract.methods.reserve(bytes, durationToReserve);
    return toTransactionObject(this.kit.connection, txo);
  };

  public extend = (name: string, durationToExtend: number) => {
    const bytes = utils.formatBytes32String(name);
    const txo = this.contract.methods.extend(bytes, durationToExtend);
    return toTransactionObject(this.kit.connection, txo);
  };

  public resolve = async (name: string) => {
    const bytes = utils.formatBytes32String(name);
    return await this.contract.methods.resolve(bytes).call();
  };

  public changeResolution = (name: string, newResolution: Address) => {
    const bytes = utils.formatBytes32String(name);
    const txo = this.contract.methods.changeResolution(bytes, newResolution);
    return toTransactionObject(this.kit.connection, txo);
  };

  public nameOwner = async (name: string) => {
    const bytes = utils.formatBytes32String(name);
    return await this.contract.methods.nameOwner(bytes).call();
  };

  public userNoms = async (address: string) => {
    const noms = await this.contract
      .getPastEvents("NameOwnerChanged", {
        fromBlock: GENESIS_BLOCK,
        toBlock: "latest",
        filter: {
          newOwner: address,
        },
      })
      .then((events) => events.map((event) => event.returnValues.name));
    const activeNoms: string[] = [];
    await Promise.all(
      noms.map(async (nom) => {
        if (
          (await this.contract.methods.nameOwner(nom).call()).toLowerCase() ===
          address.toLowerCase()
        ) {
          activeNoms.push(utils.parseBytes32String(nom));
        }
      })
    );
    return activeNoms;
  };

  public allNamesForResolution = async (resolution: string) => {
    const noms = await this.contract
      .getPastEvents("NameResolutionChanged", {
        fromBlock: GENESIS_BLOCK,
        toBlock: "latest",
        filter: {
          newResolution: resolution,
        },
      })
      .then((events) => events.map((event) => event.returnValues.name));
    const activeNoms: string[] = [];
    await Promise.all(
      noms.map(async (nom) => {
        if (
          (await this.contract.methods.resolve(nom).call()).toLowerCase() ===
          resolution.toLowerCase()
        ) {
          activeNoms.push(utils.parseBytes32String(nom));
        }
      })
    );
    return activeNoms;
  };

  public changeNameOwner = (name: string, newOwner: Address) => {
    const bytes = utils.formatBytes32String(name);
    const txo = this.contract.methods.changeNameOwner(bytes, newOwner);
    return toTransactionObject(this.kit.connection, txo);
  };

  public isExpired = async (name: string) => {
    const bytes = utils.formatBytes32String(name);
    return await this.contract.methods.isExpired(bytes).call();
  };

  public expiration = async (name: string) => {
    const bytes = utils.formatBytes32String(name);
    return Number(await this.contract.methods.expirations(bytes).call());
  };

  public feeModule = async () => {
    return this.contract.methods.feeModule().call();
  };

  public setFeeModule = (newFeeModule: Address) => {
    const txo = this.contract.methods.setFeeModule(newFeeModule);
    return toTransactionObject(this.kit.connection, txo);
  };
}
