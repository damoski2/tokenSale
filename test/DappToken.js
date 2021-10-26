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


    it('approves Tokens for delegated transfer', ()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then((success)=>{
            assert.equal(success,true,'it returns true')
            return tokenInstance.approve(accounts[1],100, { from: accounts[0] });
        }).then((reciept)=>{
            assert.equal(reciept.logs.length,1,'triggers one event');
            assert.equal(reciept.logs[0].event, 'Approval','should be the \'Approval\' event ');
            assert.equal(reciept.logs[0].args._owner,accounts[0],'logs the account the tokens are authorized from');
            assert.equal(reciept.logs[0].args._spender,accounts[1],'logs the account the tokens are authorized to');
            assert.equal(reciept.logs[0].args._value,100,'logs the transfer amount');

            return tokenInstance.allowance(accounts[0], accounts[1])
        }).then((allowance)=>{
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        })
    })

    it('handles delegated token transfer', ()=>{
        return DappToken.deployed().then((instance)=>{
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4]
            //Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then((reciept)=>{
            //Approve spendingAccounts to spend 10 tokens from fromAccounts
            return tokenInstance.approve(spendingAccount,10,{ from : fromAccount });
        }).then((reciept)=>{
            return tokenInstance.transferFrom.call(fromAccount,toAccount,10,{ from: spendingAccount })
            //try transferring something larger than the spender's balance
            //return tokenInstance.transferFrom(fromAccount,toAccount, 9999),{ from: spendingAccount };
        }).then((success)=>{
            assert.equal(success,true)
            return tokenInstance.transferFrom(fromAccount,toAccount,10,{ from: spendingAccount})
        }).then((reciept)=>{
            assert.equal(reciept.logs.length,1,'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer','should be the \'Transfer\' event ');
            assert.equal(reciept.logs[0].args._from, fromAccount,'logs the account the tokens are transferred from');
            assert.equal(reciept.logs[0].args._to,toAccount,'logs the account the tokens are transferred from');
            assert.equal(reciept.logs[0].args._value,10,'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then((balance)=>{
            assert.equal(balance.toNumber(),90,'deducts the amount from the sending account')
            return tokenInstance.balanceOf(toAccount);
        }).then(balance=>{
            assert.equal(balance.toNumber(),'10','adds the amount from the recieving account')
            return tokenInstance.allowance(fromAccount,spendingAccount);
        }).then(allowance=>{
            assert.equal(allowance.toNumber(),0,'deducts the amount from the allowance')
        })
    })

})
