import Web3V1Celo from '@celo/typechain-target-web3-v1-celo'
import { execSync } from 'child_process'
import path from 'path'
import { tsGenerator } from 'ts-generator'

const ROOT_DIR = path.normalize(path.join(__dirname, '../'))

async function generateContractTypes() {
  console.log('contractkit: Generating Types')
	const typesDir = path.join("types", "web3-v1-contracts")
  execSync(`rm -rf ${typesDir}`, {cwd: ROOT_DIR})
  const web3Generator = new Web3V1Celo({
    cwd: ROOT_DIR,
    rawConfig: {
      files: `${ROOT_DIR}/build/contracts/*.json`,
      outDir: typesDir,
    },
  })

  await tsGenerator({ cwd: ROOT_DIR, loggingLvl: 'info' }, web3Generator)
}

generateContractTypes()
.catch((err) => {
  console.error(err)
  process.exit(1)
})
