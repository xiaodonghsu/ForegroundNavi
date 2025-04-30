const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const connectionStatus = document.getElementById('status');

let ws;

// Test, 添加键盘事件监听 
document.addEventListener('keydown', (event) => {
    console.log('⌨️ Press the keyboard key:', event.key);
    if (event.key === 'ArrowRight') {
        console.log('👉 Press the right arrow key');
    } else if (event.key === 'ArrowLeft') {
        console.log('👈 Press the left arrow key');
    }
});

function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:9999`;
    console.log('🔗 Connecting to:', wsUrl);
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('✅ WebSocket Connection Established');
        connectionStatus.textContent = 'Connected';
        connectionStatus.style.color = '#28a745';
    };

    ws.onclose = () => {
        console.log('❌ WebSocket Connection Closed');
        connectionStatus.textContent = 'Connection Closed, Retrying...';
        connectionStatus.style.color = '#dc3545';
        setTimeout(connect, 1000);
    };

    ws.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        connectionStatus.textContent = 'Connection Error';
        connectionStatus.style.color = '#dc3545';
    };
}

prevBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('prev');
    } else {
        console.log('❌ WebSocket Not Connected');
    }
});

nextBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('next');
    } else {
        console.log('❌ WebSocket Not Connected');
    }
});

// 初始连接
connect(); 