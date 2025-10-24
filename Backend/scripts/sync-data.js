#!/usr/bin/env node

/**
 * Locket Backend - Data Synchronization Script
 * Syncs modular JSON files with main db.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const MAIN_DB = path.join(__dirname, '../db.json');
const CONFIG_FILE = path.join(__dirname, '../data-config.json');

class DataSyncManager {
  constructor() {
    this.config = this.loadConfig();
    this.dataFiles = this.getDataFiles();
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (error) {
      console.error('Error loading config:', error.message);
      process.exit(1);
    }
  }

  getDataFiles() {
    const files = {};
    const dataDir = DATA_DIR;
    
    if (!fs.existsSync(dataDir)) {
      console.log('Data directory does not exist, creating...');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read all JSON files in data directory
    const filesInDir = fs.readdirSync(dataDir);
    filesInDir.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const resourceName = Object.keys(content)[0]; // Get first key (resource name)
          files[resourceName] = {
            file: file,
            path: filePath,
            data: content[resourceName]
          };
        } catch (error) {
          console.error(`Error reading ${file}:`, error.message);
        }
      }
    });

    return files;
  }

  syncToMain() {
    console.log('🔄 Syncing modular files to main db.json...');
    
    const mainDb = {};
    
    // Merge all data files into main database
    Object.keys(this.dataFiles).forEach(resource => {
      const fileData = this.dataFiles[resource];
      mainDb[resource] = fileData.data;
      console.log(`✅ Synced ${resource}: ${fileData.data.length} records`);
    });

    // Write to main db.json
    try {
      fs.writeFileSync(MAIN_DB, JSON.stringify(mainDb, null, 2));
      console.log('✅ Main db.json updated successfully');
    } catch (error) {
      console.error('❌ Error writing main db.json:', error.message);
    }
  }

  syncFromMain() {
    console.log('🔄 Syncing main db.json to modular files...');
    
    if (!fs.existsSync(MAIN_DB)) {
      console.log('❌ Main db.json not found');
      return;
    }

    try {
      const mainDb = JSON.parse(fs.readFileSync(MAIN_DB, 'utf8'));
      
      Object.keys(mainDb).forEach(resource => {
        const filePath = path.join(DATA_DIR, `${resource}.json`);
        const data = { [resource]: mainDb[resource] };
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Updated ${resource}.json: ${mainDb[resource].length} records`);
      });
      
      console.log('✅ Modular files updated successfully');
    } catch (error) {
      console.error('❌ Error syncing from main db.json:', error.message);
    }
  }

  createBackup() {
    const backupDir = path.join(__dirname, '../backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('💾 Creating backup...');
    
    // Backup main db.json
    if (fs.existsSync(MAIN_DB)) {
      const backupFile = path.join(backupDir, `db-${timestamp}.json`);
      fs.copyFileSync(MAIN_DB, backupFile);
      console.log(`✅ Main database backed up to ${backupFile}`);
    }

    // Backup modular files
    Object.keys(this.dataFiles).forEach(resource => {
      const fileData = this.dataFiles[resource];
      const backupFile = path.join(backupDir, `${resource}-${timestamp}.json`);
      fs.copyFileSync(fileData.path, backupFile);
      console.log(`✅ ${resource} backed up to ${backupFile}`);
    });
  }

  showStatus() {
    console.log('\n📊 Data Status:');
    console.log('================');
    
    Object.keys(this.dataFiles).forEach(resource => {
      const fileData = this.dataFiles[resource];
      console.log(`${resource}: ${fileData.data.length} records (${fileData.file})`);
    });

    if (fs.existsSync(MAIN_DB)) {
      const mainDb = JSON.parse(fs.readFileSync(MAIN_DB, 'utf8'));
      console.log(`\nMain db.json: ${Object.keys(mainDb).length} resources`);
    } else {
      console.log('\nMain db.json: Not found');
    }
  }

  showTeamInfo() {
    console.log('\n👥 Team Responsibilities:');
    console.log('========================');
    
    Object.keys(this.config.teams).forEach(teamKey => {
      const team = this.config.teams[teamKey];
      console.log(`\n${team.name} (${teamKey}):`);
      console.log(`  Responsibility: ${team.responsibility}`);
      console.log(`  Files: ${team.files.join(', ')}`);
      console.log(`  Endpoints: ${team.endpoints.slice(0, 2).join(', ')}...`);
    });
  }

  showAdminInfo() {
    console.log('\n🔧 Admin Management:');
    console.log('====================');
    
    const adminTeam = this.config.teams.admin;
    if (adminTeam) {
      console.log(`\n${adminTeam.name}:`);
      console.log(`  Responsibility: ${adminTeam.responsibility}`);
      console.log(`  Files: ${adminTeam.files.join(', ')}`);
      console.log(`  Endpoints: ${adminTeam.endpoints.join(', ')}`);
      
      // Show admin user info
      const users = this.dataFiles.users?.data || [];
      const adminUsers = users.filter(user => user.role === 'admin');
      
      if (adminUsers.length > 0) {
        console.log('\n👤 Admin Users:');
        adminUsers.forEach(admin => {
          console.log(`  - ${admin.fullName} (${admin.username})`);
          console.log(`    Email: ${admin.email}`);
          console.log(`    Permissions: ${admin.permissions?.join(', ') || 'N/A'}`);
        });
      } else {
        console.log('\n⚠️  No admin users found');
      }
    } else {
      console.log('\n❌ Admin team not configured');
    }
  }

  validateAdminData() {
    console.log('\n🔍 Validating Admin Data:');
    console.log('==========================');
    
    const users = this.dataFiles.users?.data || [];
    const adminUsers = users.filter(user => user.role === 'admin');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
      return false;
    }
    
    let isValid = true;
    adminUsers.forEach(admin => {
      console.log(`\n👤 Validating admin: ${admin.username}`);
      
      // Check required fields
      const requiredFields = ['id', 'email', 'username', 'role', 'permissions'];
      const missingFields = requiredFields.filter(field => !admin[field]);
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
        isValid = false;
      } else {
        console.log('✅ All required fields present');
      }
      
      // Check permissions
      const requiredPermissions = ['manage_users', 'manage_photos', 'moderate_content'];
      const hasRequiredPermissions = requiredPermissions.every(perm => 
        admin.permissions?.includes(perm)
      );
      
      if (!hasRequiredPermissions) {
        console.log(`❌ Missing required permissions: ${requiredPermissions.join(', ')}`);
        isValid = false;
      } else {
        console.log('✅ All required permissions present');
      }
    });
    
    return isValid;
  }
}

// CLI Interface
const command = process.argv[2];

const syncManager = new DataSyncManager();

switch (command) {
  case 'sync-to-main':
    syncManager.syncToMain();
    break;
  case 'sync-from-main':
    syncManager.syncFromMain();
    break;
  case 'backup':
    syncManager.createBackup();
    break;
  case 'status':
    syncManager.showStatus();
    break;
  case 'teams':
    syncManager.showTeamInfo();
    break;
  case 'admin':
    syncManager.showAdminInfo();
    break;
  case 'validate-admin':
    syncManager.validateAdminData();
    break;
  default:
    console.log(`
🔄 Locket Data Sync Manager

Usage: node sync-data.js <command>

Commands:
  sync-to-main    Sync modular files to main db.json
  sync-from-main  Sync main db.json to modular files  
  backup          Create backup of all data files
  status          Show current data status
  teams           Show team responsibilities
  admin           Show admin management info
  validate-admin  Validate admin user data

Examples:
  node sync-data.js sync-to-main
  node sync-data.js status
  node sync-data.js admin
  node sync-data.js validate-admin
    `);
}
