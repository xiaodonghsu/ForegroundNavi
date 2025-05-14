const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { keyboard, Key } = require("@nut-tree/nut-js");
const os = require('os');
const qrcode = require('qrcode-terminal');
const path = require('path');

// 跟踪Alt键的状态
let isAltPressed = false;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 9999;

// 判断是否为 pkg 打包环境
const isPkg = typeof process.pkg !== 'undefined';
const staticPath = isPkg
  ? path.join(path.dirname(process.execPath), 'controller', 'public')
  : __dirname + '/../controller/public';

app.use(express.static(staticPath));

wss.on('connection', (ws) => {
  console.log('� Mobile phone controller connected');
  ws.on('message', (message) => {
    const msg = message.toString();
    console.log('📩 Received message from phone:', msg);
    if (msg === 'next') {
      try {     
        (async () => {
            await keyboard.pressKey(Key.PageDown);
            await keyboard.releaseKey(Key.PageDown);
        })();
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else if (msg === 'prev') {
      try {   
        (async () => {
            await keyboard.pressKey(Key.PageUp);
            await keyboard.releaseKey(Key.PageUp);
        })();
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else if (msg === 'switch_app') {
      try {
        (async () => {
            // 如果Alt键没有被按下，先按下Alt键
            if (!isAltPressed) {
                await keyboard.pressKey(Key.LeftAlt);
                isAltPressed = true;
                console.log('👇 Alt key pressed');
            }
            
            // 按下并释放Tab键
            await keyboard.pressKey(Key.Tab);
            // await new Promise(resolve => setTimeout(resolve, 50));
            await keyboard.releaseKey(Key.Tab);
            console.log('🔄 Tab pressed and released');
        })();
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else if (msg === 'activate_app') {
      try {
        (async () => {
            // 如果Alt键被按下，释放它
            if (isAltPressed) {
                await keyboard.releaseKey(Key.LeftAlt);
                isAltPressed = false;
                console.log('👆 Alt key released');
            }
        })();
        console.log('✅ Window selected');
      } catch (error) {
        console.error('❌ Key simulation failed:', error);
      }
    } else {
      console.log('❌ Unknown message type:', msg);
    }
  });

  ws.on('error', async (error) => {
    console.error('❌ WebSocket error:', error);
    // 确保在发生错误时释放Alt键
    if (isAltPressed) {
      try {
        await keyboard.releaseKey(Key.LeftAlt);
        isAltPressed = false;
        console.log('👆 Alt key released (due to error)');
      } catch (err) {
        console.error('❌ Failed to release Alt key:', err);
      }
    }
  });

  ws.on('close', async () => {
    console.log('🔌 The phone controller has been disconnected');
    // 确保在连接关闭时释放Alt键
    if (isAltPressed) {
      try {
        await keyboard.releaseKey(Key.LeftAlt);
        isAltPressed = false;
        console.log('👆 Alt key released (due to disconnect)');
      } catch (err) {
        console.error('❌ Failed to release Alt key:', err);
      }
    }
  });
});

server.listen(port, () => {
  const controlUrl = `http://${getLocalIP()}:${port}`;
  console.log(`\n✅ DeckTap LAN service has been started：${controlUrl}`);
  console.log('\n🔗 Please open the above link with your mobile phone under the same Wi-Fi, or scan the QR code below:\n');
  qrcode.generate(controlUrl, { small: true });
});

process.on('SIGINT', () => {
    ioHook.unload();
    ioHook.stop();
    process.exit();
  });

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  console.log('🔍 Scanning the network interface......');
  
  // 存储所有找到的 IP 地址
  const ipAddresses = [];
  
  for (let [name, iface] of Object.entries(interfaces)) {
    for (let config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        // 检查是否是有效的单播地址（不是网络地址或广播地址）
        const ipParts = config.address.split('.').map(Number);
        const lastOctet = ipParts[3];
        if (lastOctet !== 0 && lastOctet !== 255) {  // 排除网络地址和广播地址
          console.log(`📡 Discover network interfaces: ${name}`);
          console.log(`   IP Address: ${config.address}`);
          console.log(`   Subnet Mask: ${config.netmask}`);
          ipAddresses.push({
            name,
            address: config.address,
            netmask: config.netmask
          });
        }
      }
    }
  }

  // 优先选择 172. 或 192.168 开头的地址（通常是热点或本地网络）
  const localIP = ipAddresses.find(ip => 
    ip.address.startsWith('172.') || 
    ip.address.startsWith('192.168.')
  );
  
  if (localIP) {
    console.log(`✅ Choose Local IP: ${localIP.address} (${localIP.name})`);
    return localIP.address;
  }

  // 如果没有找到本地网络地址，选择第一个可用的 IP
  if (ipAddresses.length > 0) {
    console.log(`⚠️ Local network not found, use the first available IP: ${ipAddresses[0].address} (${ipAddresses[0].name})`);
    return ipAddresses[0].address;
  }

  console.log('❌ No available network interface was found, use localhost');
  return 'localhost';
}