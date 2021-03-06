# Nomspace

--

A simple name resolution service

## Nomkit documentation
### Installation

```
yarn add @nomspace/nomspace
```

You will also want ContractKit from:
`@celo/contractkit` or `@celo-tools/use-contractkit`

### Usage
```
import {NomKit} from "@nomspace/nomspace"
import {newKit} from "@celo/contractkit"

const kit = newKit("https://forno.celo.org")
const nomKit = new NomKit(kit, "0xABf8faBbC071F320F222A526A2e1fBE26429344d")

// Resolve a example.nom
// NOTE: Nomspace is case-sensitive. Convention is to always use lowercase
const resolution = await kit.resolve("example".toLowerCase());
console.log(resolution)

// Reserve a example.nom
await reserve("example").send({from: kit.accounts[0]})

```


## Contract addresses
### Mainnet
Nom: [0xABf8faBbC071F320F222A526A2e1fBE26429344d](https://explorer.celo.org/address/0xABf8faBbC071F320F222A526A2e1fBE26429344d)

FeeModuleV0: [0xD9f17C3122B36017a499f0E33cF405Ae39aDdC9e](https://explorer.celo.org/address/0xD9f17C3122B36017a499f0E33cF405Ae39aDdC9e)

FeeModuleV1: [0x07DDCB69Bc2637A6c03d5523696E21B688b42d65](https://explorer.celo.org/address/0x07DDCB69Bc2637A6c03d5523696E21B688b42d65)

### Alfajores
Nom: [0x36C976Da6A6499Cad683064F849afa69CD4dec2e](https://alfajores-blockscout.celo-testnet.org/address/0x36C976Da6A6499Cad683064F849afa69CD4dec2e)

FeeModuleV0: [0xa41b00095C14Ff7c3697485136eE53C12B3a681A](https://alfajores-blockscout.celo-testnet.org/address/0xa41b00095C14Ff7c3697485136eE53C12B3a681A)

FeeModuleV1: TODO
