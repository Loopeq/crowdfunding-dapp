// SPDX-License-IdenAfier: MIT
pragma solidity ^0.8.20;
contract Crowdfunding {
    string public projectName;
    string public descripAon;
    uint public goal;
    uint public totalFunds;
    address public owner;
 
    struct Donation {
        address donor;
        uint amount;
    }

    Donation[] public donaAons;

    constructor(string memory _name, string memory _descripAon, uint _goal) {
        projectName = _name;
        descripAon = _descripAon;
        goal = _goal;
        owner = msg.sender;
        totalFunds = 0;
    }

    function fund() public payable {
        require(msg.value > 0, "Donate more than 0");
        totalFunds += msg.value;
        donaAons.push(Donation(msg.sender, msg.value));
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(totalFunds > 0, "No funds to withdraw");
        uint amount = totalFunds;
        totalFunds = 0;
        payable(owner).transfer(amount);
    }

    function refund() public {
        require(totalFunds < goal, "Goal reached, cannot refund");
        uint refundAmount = 0;
        for (uint i = 0; i < donaAons.length; i++) {
            if (donaAons[i].donor == msg.sender && donaAons[i].amount > 0) {
                refundAmount += donaAons[i].amount;
                donaAons[i].amount = 0;
            }
        }
        require(refundAmount > 0, "No funds to refund");
        payable(msg.sender).transfer(refundAmount);
        totalFunds -= refundAmount;
    }

    function donorCount() public view returns (uint) {
        return donaAons.length;
    }
    
    function donors(uint index) public view returns (address donor, uint amount) {
        Donation storage d = donaAons[index];
        return (d.donor, d.amount);
    }
}