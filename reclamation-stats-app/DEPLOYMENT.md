# 🚀 Deployment Guide for Raspberry Pi

## **Initial Setup on Raspberry Pi**

### **1. Install Required Software**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
```

### **2. Clone Repository**
```bash
cd /home/pi
git clone https://github.com/YOUR_USERNAME/reclamation-stats-app.git
cd reclamation-stats-app
```

### **3. Install Dependencies & Build**
```bash
npm install
npm run build
```

### **4. Start with PM2**
```bash
# Start the app
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## **Updating the App (Option A - Manual)**

### **On Your Development Machine:**
1. Make changes to your code
2. Test locally with `npm run dev`
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Update: [describe your changes]"
git push origin main
```

### **On Raspberry Pi:**
1. SSH into your Pi
2. Run the update script:
```bash
cd /home/pi/reclamation-stats-app
chmod +x deploy-pi.sh
./deploy-pi.sh
```

## **Alternative Manual Update:**
```bash
cd /home/pi/reclamation-stats-app
git pull origin main
npm install
npm run build
pm2 restart reclamation-stats-app
```

## **Useful Commands**

### **PM2 Management:**
```bash
pm2 status                    # Check app status
pm2 logs reclamation-stats-app # View logs
pm2 restart reclamation-stats-app # Restart app
pm2 stop reclamation-stats-app   # Stop app
pm2 delete reclamation-stats-app # Remove from PM2
```

### **View App:**
- **Local**: http://localhost:3000
- **Network**: http://YOUR_PI_IP:3000

## **Troubleshooting**

### **If App Won't Start:**
```bash
# Check logs
pm2 logs reclamation-stats-app

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Kill process using port 3000
sudo kill -9 [PID]
```

### **If Build Fails:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## **File Structure**
```
reclamation-stats-app/
├── src/                    # Source code
├── dist/                   # Built files (production)
├── server.js               # Production server
├── ecosystem.config.js     # PM2 configuration
├── deploy-pi.sh           # Update script for Pi
├── build-prod.sh          # Build script for development
└── package.json           # Dependencies
```

## **Notes**
- The app runs on port 3000 by default
- PM2 automatically restarts the app if it crashes
- All logs are stored in the `logs/` directory
- The app will start automatically when the Pi boots up
