#!/usr/bin/env node

require('dotenv').config()
const Web3 = require('web3')
const ContractKit = require('@celo/contractkit')
const {NomKit, NomConfig} = require('./dist/src')

const {PRIVATE_KEY, RPC_URL} = process.env

const web3 = new Web3(RPC_URL)
const kit = ContractKit.newKitFromWeb3(web3)
kit.connection.addAccount(PRIVATE_KEY)

const getExplorerTx = (hash) => {
  return `${explorer}/tx/${hash}`
}

let netId, explorer, nomKit
const init = async () => {
  netId = await web3.eth.net.getId()
  explorer = netId === "44787" ?
    "https://alfajores-blockscout.celo-testnet.org" :
    "https://explorer.celo.org"
  nomKit = new NomKit(kit, NomConfig[netId]['Nom']['address'])
}

require('yargs')
  .scriptName('nomspace-cli')
  .usage('$0 <cmd> [args]')
  .command(
    'reserve [name] [duration]',
    'Reserve a name',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to reserve',
      })
      yargs.positional('duration', {
        type: 'number',
        describe: 'The length of time in seconds to reserve this name for',
      })
    },
    async (argv) => {
      await init();
      const senderAccount = (await kit.web3.eth.getAccounts())[0]
      const txo = nomKit.reserve(argv.name, argv.duration)
      try {
        const tx = await txo.send({from: senderAccount})
        console.log("Reservation tx:", getExplorerTx(await tx.getHash()))
      } catch (e) {
        console.error(e)
      }
    },
  )
  .command(
    'extend [name] [duration]',
    'Extend a name reservation',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to extend the reservation of',
      })
      yargs.positional('duration', {
        type: 'number',
        describe: 'The length of time in seconds to extend this name for',
      })
    },
    async (argv) => {
      await init();
      const senderAccount = (await kit.web3.eth.getAccounts())[0]
      const txo = nomKit.extend(argv.name, argv.duration)
      try {
        const tx = await txo.send({from: senderAccount})
        console.log("Extension tx:", getExplorerTx(await tx.getHash()))
      } catch (e) {
        console.error(e)
      }
    },
  )
  .command(
    'resolve [name]',
    'Resolve a name',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to resolve',
      })
    },
    async (argv) => {
      await init();
      console.log("Resolution:", await nomKit.resolve(argv.name))
    },
  )
  .command(
    'cr [name] [address]',
    'Change a resolution',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to change the resolution of',
      })
      yargs.positional('address', {
        type: 'string',
        describe: 'The new resolution for this name',
      })
    },
    async (argv) => {
      await init();
      const senderAccount = (await kit.web3.eth.getAccounts())[0]
      const txo = nomKit.changeResolution(argv.name, argv.address)
      try {
        const tx = await txo.send({from: senderAccount})
        console.log("Resolution change tx:", getExplorerTx(await tx.getHash()))
      } catch (e) {
        console.error(e)
      }
    },
  )
  .command(
    'owner [name]',
    'Get the owner of a name',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to fetch the owner of',
      })
    },
    async (argv) => {
      await init();
      console.log("Owner:", await nomKit.nameOwner(argv.name))
    },
  )
  .command(
    'co [name] [address]',
    "Change a name's owner",
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to change the owner of',
      })
      yargs.positional('address', {
        type: 'string',
        describe: 'The new owner for this name',
      })
    },
    async (argv) => {
      await init();
      const senderAccount = (await kit.web3.eth.getAccounts())[0]
      const txo = nomKit.changeNameOwner(argv.name, argv.address)
      try {
        const tx = await txo.send({from: senderAccount})
        console.log("Owner change tx:", getExplorerTx(await tx.getHash()))
      } catch (e) {
        console.error(e)
      }
    },
  )
  .command(
    'expiration [name]',
    'Get the expiration of a name',
    (yargs) => {
      yargs.positional('name', {
        type: 'string',
        describe: 'The name to fetch the expiration of',
      })
    },
    async (argv) => {
      await init();
      console.log("Expiration:", await nomKit.expiration(argv.name))
    },
  )
  .help()
  .argv
