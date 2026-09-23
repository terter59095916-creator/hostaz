#!/bin/bash
set -e
echo "=== Node.js ve Git qurashdirilir ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
echo "=== Oyun kodu yuklenir ==="
git clone https://github.com/terter59095916-creator/hostaz.git
cd hostaz
echo "=== Asililiqlar qurashdirilir ==="
npm install
echo "=== PM2 qurashdirilir ==="
sudo npm install -g pm2
echo ""
echo "=== HAZIRDIR ==="
echo "Indi: cd hostaz && nano .env  ile duzeldin, sonra: pm2 start server.js --name hostaz"