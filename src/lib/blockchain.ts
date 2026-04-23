import CryptoJS from 'crypto-js';

export interface VoteTransaction {
  voter: string;
  proposalId: number;
  timestamp: number;
  signature: string;
}

export interface Block {
  index: number;
  timestamp: number;
  votes: VoteTransaction[];
  previousHash: string;
  nonce: number;
  hash: string;
}

export class Blockchain {
  chain: Block[];
  difficulty: number = 2; // Fixed difficulty for demo speed
  pendingVotes: VoteTransaction[] = [];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  private createGenesisBlock(): Block {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      votes: [],
      previousHash: '0',
      nonce: 0,
      hash: '',
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  calculateHash(block: Omit<Block, 'hash'>): string {
    return CryptoJS.SHA256(
      block.index +
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.votes) +
      block.nonce
    ).toString();
  }

  mineBlock(): Block {
    const latestBlock = this.getLatestBlock();
    const newBlock: Block = {
      index: latestBlock.index + 1,
      timestamp: Date.now(),
      votes: [...this.pendingVotes],
      previousHash: latestBlock.hash,
      nonce: 0,
      hash: '',
    };

    while (
      this.calculateHash(newBlock).substring(0, this.difficulty) !==
      Array(this.difficulty + 1).join('0')
    ) {
      newBlock.nonce++;
    }

    newBlock.hash = this.calculateHash(newBlock);
    this.chain.push(newBlock);
    this.pendingVotes = [];
    return newBlock;
  }

  addVote(voter: string, proposalId: number) {
    // Simple signature simulation (voter address + proposalId hash)
    const signature = CryptoJS.HmacSHA256(
      `${voter}-${proposalId}-${Date.now()}`,
      'secret-key'
    ).toString();

    const transaction: VoteTransaction = {
      voter,
      proposalId,
      timestamp: Date.now(),
      signature,
    };

    this.pendingVotes.push(transaction);
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getTally(): Record<number, number> {
    const tally: Record<number, number> = {};
    this.chain.forEach(block => {
      block.votes.forEach(vote => {
        tally[vote.proposalId] = (tally[vote.proposalId] || 0) + 1;
      });
    });
    return tally;
  }

  hasVoted(address: string): boolean {
    // Check chain and pending
    const inChain = this.chain.some(block =>
      block.votes.some(v => v.voter === address)
    );
    const inPending = this.pendingVotes.some(v => v.voter === address);
    return inChain || inPending;
  }
}

// Global instance for the app
export const blockchain = new Blockchain();
