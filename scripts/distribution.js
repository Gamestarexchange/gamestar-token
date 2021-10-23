// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const fs = require('fs')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const GMSToken = await hre.ethers.getContractFactory("GMSToken");
  const gms = await GMSToken.attach("");

    const startIndex = 4800;
    const endIndex = 5468;
    try {
        const dataStr = fs.readFileSync('dlist.txt', 'utf8');
        const dataArr = dataStr.split("\r\n");
        const amounts = [];
        const addresses = [];
        for (let index = 0; index < (endIndex - startIndex); index ++) {
            amounts[index] = '15000000000000000000';
            addresses[index] = dataArr[index + startIndex];
        }

        const tx = await gms.distributionUnLock(addresses, amounts);
        console.log(tx.hash);
    } catch (e) {
        console.error(e);
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
