//const { assert } = require("console");
const DappToken = artifacts.require('DappToken')

contract('DappToken',  (accounts)=>{


    it('initializes the contract with the correct values', async()=>{
        let tokenInstance, name, symbol, standard;
        tokenInstance = await DappToken.deployed();
        name = await tokenInstance.name();
        assert.equal(name,'DApp Token','has the correct name');
        symbol = await tokenInstance.symbol();
        assert.equal(symbol,'DApp','has the correct symbol');
        standard = await tokenInstance.standard();
        assert.equal(standard,'DApp Token v1.0','has the correct standard');
    })

    it('allocates the initial supply upon deployment', async ()=>{
        let tokenInstance, totalSupply, adminBalance;
        tokenInstance = await DappToken.deployed();
        totalSupply = await tokenInstance.totalSupply();
        assert.equal(totalSupply.toNumber(),1000000,'sets the totalSupply to 1 million')

        adminBalance = await tokenInstance.balanceOf(accounts[0]);
        assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account')
    })


    it('Transfer token ownership', ()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance = instance
            return tokenInstance.transfer.call(accounts[1],250000, { from: accounts[0] })
        }).then((success)=>{
            assert.equal(success,true,'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then((reciept)=>{

            assert.equal(reciept.logs.length,1,'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer','should be the \'Transfer\' event ');
            assert.equal(reciept.logs[0].args._from,accounts[0],'logs the account the tokens are transferred from');
            assert.equal(reciept.logs[0].args._to,accounts[1],'logs the account the tokens are transferred from');
            assert.equal(reciept.logs[0].args._value,250000,'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then((balance)=>{
            assert.equal(balance.toNumber(),250000,'adds the amount to the recieving account');
            return tokenInstance.balanceOf(accounts[0])
        }).then((balance)=>{
            assert.equal(balance.toNumber(),750000,'deducts the amount from the sender account')
        })
    })


})
