// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/*
suppose client & dev wants to transact for 500 USDC
first client must pay double of that i.e 1000 USDC to the contract
also dev needs to pay 500 USDC to the contract

in case of a yes-yes settlement, dev gets 1000 USDC, client gets 500 USDC
in case of a no-no settlement, dev gets 500 USDC, client gets 1000 USDC
in case of no settlement, dev losed 500 USDC, client loses 1000 USDC.

if the transaction is inactive then the buyer or seller can withdraw the tokens
only once the transaction becomes active, are the tokens are locked & the transaction
must be Success or Cancelled for the buyer/seller to withdraw the funds
*/

contract Escrow is Ownable {
    using SafeERC20 for IERC20;

    event TransactionCreated(Transaction transaction);
    event TransactionActivated(uint id);
    event TransactionSuccess(uint id);
    event TransactionCancelled(uint id);

    enum TransactionState {
        InActive,
        Active,
        Success,
        Cancelled
    }

    struct Transaction {
        uint id;
        address buyer;
        address seller;
        IERC20 token;
        uint amount; // the amount of tokens that the buyer has to pay the seller
        uint buyerStake; // amount of tokens locked in the transaction by the buyer
        uint sellerStake; // amount of tokens locked in the transaction by the seller
        TransactionState state;
        bool buyerState;
        bool sellerState;  // set this to true at struct initialisation
    }

    uint32 public FEES = 10000; // 1%
    uint32 public constant MAX_PPM = 1000000; 
    mapping(uint => Transaction) public transactions;


    /*
        @info called to create a new transaction 
    */
    function createTransaction(address _buyer, address _seller, address _token, uint _amount) public returns (uint) {
        uint _id = uint(keccak256(abi.encodePacked(_buyer, _seller, block.timestamp)));
            Transaction memory _transaction = Transaction(
                 _id,
                 _buyer,
                 _seller,
                 IERC20(_token),
                 _amount,
                 0,
                 0,
                 TransactionState.InActive,
                 false,
                 true               
            );

            transactions[_id] = _transaction;
            emit TransactionCreated(_transaction);
            return _transaction.id;
    }


    /*
        called by the buyer & seller individually to stake tokens in the
        transaction. Once the required tokens are staked by both the parties,
        the transaction is activated automatically
    */
    function activateTransaction(uint _id, uint _amount, address _for) public {
        Transaction storage _transaction = transactions[_id];
        require(_transaction.state == TransactionState.InActive, "Must be Inactive");
        _transaction.token.safeTransferFrom(msg.sender, address(this), _amount);

        if (_for == _transaction.buyer) {
            _transaction.buyerStake = _amount;
        } else if (_for == _transaction.seller) {
            _transaction.sellerStake = _amount;
        } else {
            require(false, "Not buyer or seller");
        }

        // buyer must put twice the transaction amount
        // and seller must put equal of the transaction amount
        if (_transaction.buyerStake >= 2* _transaction.amount && _transaction.sellerStake >= _transaction.amount) {
            _transaction.state = TransactionState.Active;
            emit TransactionActivated(_transaction.id);
        }
    }

    /*
        called by the buyer/seller to change his/her
        individual state for the transaction
    */
    function changeMyState(uint _id, bool _state) public {
        Transaction storage _transaction = transactions[_id];
        require(_transaction.state == TransactionState.Active, "Not Active");

        if (msg.sender == _transaction.buyer) {
            _transaction.buyerState = _state;
        } else if (msg.sender == _transaction.seller) {
            _transaction.sellerState = _state;
        } else {
            require(false, "Not buyer or seller");
        }

        // change transaction state too based on results
        if (_transaction.buyerState == true && _transaction.sellerState == true) {
            _transaction.state = TransactionState.Success;
            _transaction.buyerStake = _transaction.amount;
            _transaction.sellerStake = _transaction.amount * 2;
            emit TransactionSuccess(_transaction.id);
        } else if (_transaction.buyerState == false && _transaction.sellerState == false) {
            _transaction.state = TransactionState.Cancelled;
            emit TransactionCancelled(_transaction.id);
        }
    }

    /*
        called by buyer/seller to withdraw the tokens
        minus fees to the escrow 
    */
    function withdrawAll(uint _id) public {
        Transaction storage _transaction = transactions[_id];
        require(_transaction.state != TransactionState.Active, "Transaction Active!");
        uint _amt;
        uint _fees;

        if (msg.sender == _transaction.buyer) {
            _fees = (_transaction.buyerStake * FEES) / MAX_PPM;
            _amt = _transaction.buyerStake - _fees;
            _transaction.buyerStake = 0;
        } else if (msg.sender == _transaction.seller) {
            _fees = (_transaction.sellerStake * FEES) / MAX_PPM;
            _amt = _transaction.sellerStake - _fees;
            _transaction.sellerStake = 0;
        }

        require(_amt > 0);
        _transaction.token.safeTransfer(msg.sender, _amt);
        _transaction.token.safeTransfer(owner(), _fees);
        
    }

    function changeFees(uint32 _fees) external onlyOwner {
        require(_fees <= MAX_PPM);
        FEES = _fees;
    }

}