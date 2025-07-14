import fs from 'fs/promises';
import path from 'path';

const DB_PATH = process.env.DB_PATH || './db';

class Database {
  constructor() {
    this.cache = new Map();
  }

  async readFile(filename) {
    const filePath = path.join(DB_PATH, filename);
    
    try {
      if (this.cache.has(filename)) {
        return this.cache.get(filename);
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      this.cache.set(filename, parsed);
      return parsed;
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  async writeFile(filename, data) {
    const filePath = path.join(DB_PATH, filename);
    
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      this.cache.set(filename, data);
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  // Dreams operations
  async getDreams() {
    return await this.readFile('dreams.json');
  }

  async getDreamById(id) {
    const dreams = await this.getDreams();
    return dreams.find(dream => dream.id === id);
  }

  async updateDream(id, updates) {
    const dreams = await this.getDreams();
    const index = dreams.findIndex(dream => dream.id === id);
    
    if (index !== -1) {
      dreams[index] = { ...dreams[index], ...updates, lastUpdated: new Date().toISOString() };
      await this.writeFile('dreams.json', dreams);
      return dreams[index];
    }
    
    return null;
  }

  async addDream(dream) {
    const dreams = await this.getDreams();
    const newDream = {
      ...dream,
      id: `dream-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    dreams.push(newDream);
    await this.writeFile('dreams.json', dreams);
    return newDream;
  }

  // Pledges operations
  async getPledges() {
    return await this.readFile('pledges.json');
  }

  async getPledgesByDream(dreamId) {
    const pledges = await this.getPledges();
    return pledges.filter(pledge => pledge.dreamId === dreamId);
  }

  async addPledge(pledge) {
    const pledges = await this.getPledges();
    const newPledge = {
      ...pledge,
      id: `pledge-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    pledges.push(newPledge);
    await this.writeFile('pledges.json', pledges);
    return newPledge;
  }

  // Vaults operations
  async getVaults() {
    return await this.readFile('vaults.json');
  }

  async getVaultById(id) {
    const vaults = await this.getVaults();
    return vaults.find(vault => vault.id === id);
  }

  async getVaultsByNGO(ngoAddress) {
    const vaults = await this.getVaults();
    return vaults.filter(vault => vault.ngo === ngoAddress);
  }

  async updateVault(id, updates) {
    const vaults = await this.getVaults();
    const index = vaults.findIndex(vault => vault.id === id);
    
    if (index !== -1) {
      vaults[index] = { ...vaults[index], ...updates, lastChecked: new Date().toISOString() };
      await this.writeFile('vaults.json', vaults);
      return vaults[index];
    }
    
    return null;
  }

  async addVault(vault) {
    const vaults = await this.getVaults();
    const newVault = {
      ...vault,
      id: `vault-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastChecked: new Date().toISOString()
    };
    
    vaults.push(newVault);
    await this.writeFile('vaults.json', vaults);
    return newVault;
  }

  // Users operations
  async getUsers() {
    return await this.readFile('users.json');
  }

  async getUserByAddress(address) {
    const users = await this.getUsers();
    return users.find(user => user.address === address);
  }

  async updateUser(address, updates) {
    const users = await this.getUsers();
    const index = users.findIndex(user => user.address === address);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await this.writeFile('users.json', users);
      return users[index];
    }
    
    return null;
  }

  // Events operations
  async getEvents() {
    return await this.readFile('events.json');
  }

  async addEvent(event) {
    const events = await this.getEvents();
    const newEvent = {
      ...event,
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      processed: false
    };
    
    events.push(newEvent);
    await this.writeFile('events.json', events);
    return newEvent;
  }

  async markEventProcessed(eventId) {
    const events = await this.getEvents();
    const index = events.findIndex(event => event.id === eventId);
    
    if (index !== -1) {
      events[index].processed = true;
      await this.writeFile('events.json', events);
      return events[index];
    }
    
    return null;
  }

  // Statistics
  async getStats() {
    const dreams = await this.getDreams();
    const pledges = await this.getPledges();
    const vaults = await this.getVaults();
    const users = await this.getUsers();

    return {
      totalDreams: dreams.length,
      completedDreams: dreams.filter(d => d.isComplete).length,
      approvedDreams: dreams.filter(d => d.isApproved).length,
      pendingDreams: dreams.filter(d => !d.isApproved && !d.isComplete).length,
      totalPledges: pledges.length,
      totalPledgeAmount: pledges.reduce((sum, p) => sum + p.amount, 0),
      totalVaults: vaults.length,
      activeVaults: vaults.filter(v => v.isActive).length,
      totalUsers: users.filter(u => u.role === 'user').length,
      totalNGOs: users.filter(u => u.role === 'ngo').length,
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new Database();