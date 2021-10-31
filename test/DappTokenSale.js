const DappTokenSale = artifacts.require("DappTokenSale");
const DappToken = artifacts.require("DappToken");

contract('DappTokenSale', (accounts)=>{
    let tokenSaleInstance, tokenPrice = 1000000000000000, buyer = accounts[1], numberOfTokens = 10, admin = accounts[0],
    tokensAvailable = 750000; //wei

    it('initializes the contracts with the correct values', async()=>{
        tokenSaleInstance = await DappTokenSale.deployed();
        let address = tokenSaleInstance.address
        assert.notEqual(address, 0x0, 'has contract address')
        let Tcontract = await tokenSaleInstance.tokenContract();
        assert.notEqual(Tcontract,0x0,'has token contrats address')
        let price = await tokenSaleInstance.tokenPrice();
        assert.equal(price.toNumber(),tokenPrice,'token price is correct');
    })

    it('facilitates token buying', async()=>{
        tokenInstance = await DappToken.deployed();
        tokenSaleInstance = await DappTokenSale.deployed();
        //Provision 75% of all tokens to the token sale
        let result = await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
        result = await tokenSaleInstance.buyTokens(numberOfTokens, { from : buyer, value: numberOfTokens * tokenPrice })
        assert.equal(result.logs.length,1,'triggers one event');
        assert.equal(result.logs[0].event,'Sell','should be the \'Sell\' event');
        assert.equal(result.logs[0].args._buyer,buyer,'logs the account that purchased the tokens');
        assert.equal(result.logs[0].args._amount,numberOfTokens,'logs the number of tokens purchased')
        let tokenSoldRes = await tokenSaleInstance.tokenSold();
        assert.equal(tokenSoldRes.toNumber(), numberOfTokens, 'increments the number of tokens sold');
        let balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        balance = await tokenInstance.balanceOf(buyer)
        assert.equal(balance.toNumber(), numberOfTokens);
        tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice }).then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert') >= 0,'tokens not enough')
        })
        //Try to buy tokens different from the ether value

    })


    it('ends token sale', async()=>{
        let tokenInstance = await DappToken.deployed();
        let tokenSaleInstance = await DappTokenSale.deployed();
        //Try to end sale from acount other than the admin
        await tokenSaleInstance.endSale({ from: buyer }).then(assert.fail).catch(error=>{
            assert(error.message.indexOf('revert') >= 0,'must be admin to end sale')
        })
      try{
        let result = await tokenSaleInstance.endSale({ from: admin });
        let balance = await tokenInstance.balanceOf(admin);
        assert.equal(balance.toNumber(), 999990, 'return all unsold dapp tokens to admin')
        let price = await tokenSaleInstance.tokenPrice();
        assert.equal(price.toNumber(),0,'token price was reset');
      }catch(e){
          console.log(e)
      }
    })
})