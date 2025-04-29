# DeckTap (LAN MVP)

📡 DeckTap is a lightweight local-network remote for controlling presentations.  
Use your phone to wirelessly control PowerPoint, Keynote, PDF slideshows — no app installation needed.

---

## ✨ Features

- 📱 Control slides via your phone browser
- 🌐 Works over local Wi-Fi network
- 🖥 Simulates keyboard arrow keys to navigate slides
- 🚀 Minimal setup: run a local Node.js server and scan a QR code
- 🔒 No internet required, safe and private

---

## 📦 Project Structure
```yaml
decktap/
├── client/            # Computer side agent
│    ├── lan.js        # LAN control
│    ├── cloud.js      # Connect cloud relay server in the future
│    └── config.js
│
├── controller/        # Mobile phone controller web page（公用）
│    └── index.html
│
├── server-cloud/      # Cloud server for remote control in the future
│    └── server.js
│
├── README.md
├── LICENSE
├── package.json
└── .gitignore
```

## 🚀 Getting Started (LAN Mode)