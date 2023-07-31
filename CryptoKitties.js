const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");

describe("KittyCore & SaleClockAuction", () => {
    async function deployKittyCore() {
        const Signers = await ethers.getSigners();

        const KittyCoreContract = await ethers.getContractFactory("KittyCore");
        const KittyCore = await KittyCoreContract.deploy();

        return { KittyCore, Signers };
    }

    async function deploySaleClockAuction() {
        const cut = 375;
        const SaleClockAuctionContract = await ethers.getContractFactory("SaleClockAuction");
        const SaleClockAuction = await SaleClockAuctionContract.deploy(kittyCore.address, cut);

        return { SaleClockAuction };
    }

    let kittyCore;
    let saleClockAuction;
    let signers;

    before(async () => {
        // deploy KittyCore
        const {KittyCore, Signers } = await loadFixture(deployKittyCore);
        kittyCore = KittyCore;
        signers = Signers;
        console.log(`signers: ${JSON.stringify(signers)}`);

        await kittyCore.setCFO(signers[1].address);

        const { SaleClockAuction } = await loadFixture(deploySaleClockAuction);
        saleClockAuction = SaleClockAuction;

        await kittyCore.setSaleAuctionAddress(saleClockAuction.address);

        console.log(`KittyCore: ${kittyCore.address}, SaleClockAuction: ${saleClockAuction.address}`);
    });

    describe("KittyCore Constructor", () => {
        it("KittyAccessControl Values Check", async () => {
            const ceo = await kittyCore.ceoAddress();
            const cfo = await kittyCore.cfoAddress();
            const coo = await kittyCore.cooAddress();
            console.log(`ceo: ${ceo}, cfo: ${cfo}, coo: ${coo}`);

            expect(ceo).to.equal(signers[0].address);
            expect(cfo).to.equal(signers[1].address);
            expect(coo).to.equal(signers[0].address);
        });

        it("KittyBase Constructor", async () => {
            const name = await kittyCore.name();
            const symbol = await kittyCore.symbol();
            console.log(`name: ${name}, symbol: ${symbol}`);

            expect(name).to.equal("CryptoKitties");
            expect(symbol).to.equal("CK");
        });
    });
});