// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Proposal {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 votedProposalId;
    }

    address public admin;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    event Voted(address indexed voter, uint256 indexed proposalId);
    event ProposalAdded(uint256 indexed id, string name);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(string[] memory proposalNames) {
        admin = msg.sender;
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                id: i,
                name: proposalNames[i],
                voteCount: 0
            }));
            emit ProposalAdded(i, proposalNames[i]);
        }
    }

    function vote(uint256 proposalId) public {
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(proposalId < proposals.length, "Invalid proposal");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        proposals[proposalId].voteCount++;

        emit Voted(msg.sender, proposalId);
    }

    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getProposalCount() public view returns (uint256) {
        return proposals.length;
    }
}
