const { ethers } = require("hardhat");

async function main() {
  const [executor] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", executor.address);
  console.log("Account balance:", (await executor.getBalance()).toString());

  //Deploy Token
  const Token = await ethers.getContractFactory("Token");
  const supply = ethers.utils.parseEther("1000");
  console.log(supply.toString());

  const token = await Token.deploy("Token", "TK", supply);
  console.log("Token contract deployed to", token.address);

  const NFT = await ethers.getContractFactory("MyToken");
  const nft = await NFT.deploy();
  console.log("nft is deployed to", nft.address);
  //Deploy TimeLock

  const minDelay = 0;
  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timelock = await TimeLock.deploy(
    minDelay,
    [executor.address],
    [executor.address]
  );
  console.log("timelockContract", timelock.address);

  //Deploy Governance
  const Governance = await ethers.getContractFactory("MyGovernor");
  const governance = await Governance.deploy(token.address, timelock.address);
  console.log("Governance Token is deployed to", governance.address);

  //Deploy Treausry Contract
  const MarketPlace = await ethers.getContractFactory("NftMarketplace");
  const marketplace = await MarketPlace.deploy();
  console.log("MarketPlace contract deployed to", marketplace.address);
  await marketplace.transferOwnership(timelock.address);
  const owner = await marketplace.owner();
  console.log("treasury", owner);

  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(token, "Token");
  saveFrontendFiles(timelock, "TimeLock");
  saveFrontendFiles(governance, "MyGovernor");
  saveFrontendFiles(marketplace, "NftMarketplace");
  saveFrontendFiles(nft, "MyToken");
}
function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
