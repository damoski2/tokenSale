//const { assert } = require("console");

const DappToken = artifacts.require('DappToken')

contract('DappToken',  (account)=>{

    it('sets the total supply upon deployment', async ()=>{
        let tokenInstance, totalSupply;
        tokenInstance = await DappToken.deployed();
        totalSupply = await tokenInstance.totalSupply();
        assert.equal(totalSupply.toNumber(),1000000,'sets the totalSupply to 1 million')
    })
})
