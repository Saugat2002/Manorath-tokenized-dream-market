import { suiClient, CONTRACT_CONFIG } from '../config/sui.js';
import database from './database.js';
import { processVaultEligibility } from './vaultProcessor.js';

class EventListener {
  constructor() {
    this.isListening = false;
    this.lastProcessedCheckpoint = null;
    this.eventHandlers = {
      'DreamCreated': this.handleDreamCreated.bind(this),
      'DreamApproved': this.handleDreamApproved.bind(this),
      'DreamRejected': this.handleDreamRejected.bind(this),
      'DreamCompleted': this.handleDreamCompleted.bind(this),
      'PledgeMade': this.handlePledgeMade.bind(this),
      'VaultCreated': this.handleVaultCreated.bind(this),
      'MonthlyContribution': this.handleMonthlyContribution.bind(this),
      'MatchReleased': this.handleMatchReleased.bind(this),
    };
  }

  async startListening() {
    if (this.isListening) {
      console.log('Event listener already running');
      return;
    }

    if (!CONTRACT_CONFIG.PACKAGE_ID) {
      console.warn('Package ID not configured, event listening disabled');
      return;
    }

    this.isListening = true;
    console.log('Starting event listener for package:', CONTRACT_CONFIG.PACKAGE_ID);

    try {
      // Get the latest checkpoint to start from
      const latestCheckpoint = await suiClient.getLatestCheckpointSequenceNumber();
      this.lastProcessedCheckpoint = latestCheckpoint;

      // Start polling for events
      this.pollEvents();
    } catch (error) {
      console.error('Error starting event listener:', error);
      this.isListening = false;
    }
  }

  async pollEvents() {
    if (!this.isListening) return;

    try {
      // Query events from the last processed checkpoint
      const events = await suiClient.queryEvents({
        query: {
          MoveModule: {
            package: CONTRACT_CONFIG.PACKAGE_ID,
            module: 'DreamNFT'
          }
        },
        cursor: this.lastProcessedCheckpoint,
        limit: 50,
        order: 'ascending'
      });

      // Process each event
      for (const event of events.data) {
        await this.processEvent(event);
      }

      // Update last processed checkpoint
      if (events.data.length > 0) {
        this.lastProcessedCheckpoint = events.data[events.data.length - 1].id.txDigest;
      }

      // Query NGO Vault events
      const vaultEvents = await suiClient.queryEvents({
        query: {
          MoveModule: {
            package: CONTRACT_CONFIG.PACKAGE_ID,
            module: 'NGOVault'
          }
        },
        cursor: this.lastProcessedCheckpoint,
        limit: 50,
        order: 'ascending'
      });

      // Process vault events
      for (const event of vaultEvents.data) {
        await this.processEvent(event);
      }

    } catch (error) {
      console.error('Error polling events:', error);
    }

    // Continue polling every 5 seconds
    setTimeout(() => this.pollEvents(), 5000);
  }

  async processEvent(event) {
    try {
      const eventType = event.type.split('::').pop();
      const handler = this.eventHandlers[eventType];

      if (handler) {
        console.log(`Processing event: ${eventType}`, event.id.txDigest);
        await handler(event);
        
        // Store event in database
        await database.addEvent({
          type: eventType,
          transactionHash: event.id.txDigest,
          blockNumber: event.checkpoint,
          data: event.parsedJson,
          processed: true
        });
      } else {
        console.log(`Unknown event type: ${eventType}`);
      }
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }

  async handleDreamCreated(event) {
    const { dream_id, owner, title, goal_amount } = event.parsedJson;
    
    await database.addDream({
      id: dream_id,
      owner,
      title,
      goalAmount: parseInt(goal_amount),
      savedAmount: 0,
      isComplete: false,
      isApproved: false,
      transactionHash: event.id.txDigest
    });

    console.log(`Dream created: ${title} by ${owner}`);
  }

  async handleDreamApproved(event) {
    const { dream_id, approved_by } = event.parsedJson;
    
    await database.updateDream(dream_id, {
      isApproved: true,
      approvedAt: new Date().toISOString()
    });

    console.log(`Dream approved: ${dream_id}`);
  }

  async handleDreamRejected(event) {
    const { dream_id, rejected_by } = event.parsedJson;

    await database.updateDream(dream_id, {
      isApproved: false,
      rejectedAt: new Date().toISOString()
    });

    console.log(`Dream rejected: ${dream_id} by ${rejected_by}`);
  }

  async handleDreamCompleted(event) {
    const { dream_id, completed_by, final_amount } = event.parsedJson;

    await database.updateDream(dream_id, {
      isComplete: true,
      savedAmount: parseInt(final_amount),
      completedAt: new Date().toISOString()
    });

    console.log(`🎉 Dream completed: ${dream_id} by ${completed_by}`);
  }

  async handlePledgeMade(event) {
    const { dream_id, pledger, amount } = event.parsedJson;
    
    // Add pledge record
    await database.addPledge({
      dreamId: dream_id,
      pledger,
      amount: parseInt(amount),
      transactionHash: event.id.txDigest,
      status: 'confirmed'
    });

    // Update dream saved amount
    const dream = await database.getDreamById(dream_id);
    if (dream) {
      const newSavedAmount = dream.savedAmount + parseInt(amount);
      const isComplete = newSavedAmount >= dream.goalAmount;
      
      await database.updateDream(dream_id, {
        savedAmount: newSavedAmount,
        isComplete,
        ...(isComplete && { completedAt: new Date().toISOString() })
      });

      // Check if any vaults are eligible for release
      if (isComplete) {
        await processVaultEligibility(dream_id);
      }
    }

    console.log(`Pledge made: ${amount} to ${dream_id} by ${pledger}`);
  }

  async handleVaultCreated(event) {
    const { vault_id, dream_id, ngo, match_amount, min_amount } = event.parsedJson;
    
    await database.addVault({
      id: vault_id,
      dreamId: dream_id,
      ngo,
      matchAmount: parseInt(match_amount),
      minAmount: parseInt(min_amount),
      contributedAmount: 0,
      isActive: true,
      transactionHash: event.id.txDigest
    });

    console.log(`Vault created: ${vault_id} for dream ${dream_id}`);
  }

  async handleMonthlyContribution(event) {
    const { vault_id, contributed_amount } = event.parsedJson;
    
    await database.updateVault(vault_id, {
      contributedAmount: parseInt(contributed_amount)
    });

    // Check if vault is eligible for release
    const vault = await database.getVaultById(vault_id);
    if (vault && vault.contributedAmount >= vault.minAmount) {
      await processVaultEligibility(vault.dreamId);
    }

    console.log(`Monthly contribution recorded for vault: ${vault_id}`);
  }

  async handleMatchReleased(event) {
    const { vault_id, dream_id, amount } = event.parsedJson;
    
    await database.updateVault(vault_id, {
      isActive: false,
      releasedAt: new Date().toISOString()
    });

    // Update dream with match amount
    const dream = await database.getDreamById(dream_id);
    if (dream) {
      await database.updateDream(dream_id, {
        savedAmount: dream.savedAmount + parseInt(amount)
      });
    }

    console.log(`Match released: ${amount} from vault ${vault_id} to dream ${dream_id}`);
  }

  stopListening() {
    this.isListening = false;
    console.log('Event listener stopped');
  }
}

export default new EventListener();