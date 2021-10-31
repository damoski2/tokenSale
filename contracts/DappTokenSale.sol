pragma solidity >=0.4.22 <0.9.0;


import "./DappToken.sol";

contract DappTokenSale {
    address payable admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(DappToken _tokenContract, uint256 _tokenPrice) public{
        admin = payable(msg.sender);
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }


    //multuply
    function multiply(uint x, uint y) internal pure returns(uint z){
        require(y == 0 || (z = x * y)/y == x);
    }

    //BuyTokens
    function buyTokens(uint256 _numberOfTokens) public payable{
        require(msg.value == multiply(_numberOfTokens , tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        //Keep track of the number of token sold
        tokenSold += _numberOfTokens;

        //Trigger a sell event
        emit Sell(payable(msg.sender),_numberOfTokens);
    
    }


    //End Sale
    function endSale() public{
        //Require admin
        require(payable(msg.sender) == admin);
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
        //Destroy contract
        selfdestruct(admin);
    }
}