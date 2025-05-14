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

// 计时器相关变量
let timerInterval;
let seconds = 0;
let isRunning = false;

// 计时器显示元素
const timerDisplay = document.querySelector('.timer-display');

// 格式化时间
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 更新计时器显示
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(seconds);
}

// 开始计时
document.getElementById('startTimer').addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }
});

// 暂停计时
document.getElementById('pauseTimer').addEventListener('click', () => {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
    }
});

// 重置计时
document.getElementById('resetTimer').addEventListener('click', () => {
    isRunning = false;
    clearInterval(timerInterval);
    seconds = 0;
    updateTimerDisplay();
});

// 左右手切换功能
const controls = document.querySelector('.controls');
const toggleHandBtn = document.getElementById('toggleHand');
const handIcon = document.querySelector('.hand-icon');

toggleHandBtn.addEventListener('click', () => {
    controls.classList.toggle('right-handed');
    handIcon.textContent = controls.classList.contains('right-handed') ? '👉' : '👈';
});

// 保存用户偏好到本地存储
function saveHandPreference(isRightHanded) {
    localStorage.setItem('isRightHanded', isRightHanded);
}

function loadHandPreference() {
    const isRightHanded = localStorage.getItem('isRightHanded') === 'true';
    if (isRightHanded) {
        controls.classList.add('right-handed');
        handIcon.textContent = '👉';
    }
}

// 页面加载时恢复用户偏好
loadHandPreference(); 

// 窗口切换功能
const switchAppBtn = document.getElementById('switchApp');
let switchTimer = null;

// 自动确认函数
const autoConfirm = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('activate_app');
        console.log('✅ Window selected');
    }
};

switchAppBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        // 发送切换命令
        ws.send('switch_app');
        console.log('🔄 Switching Window');

        // 清除之前的计时器
        if (switchTimer) {
            clearTimeout(switchTimer);
        }

        // 设置新的计时器，1秒后自动确认
        switchTimer = setTimeout(autoConfirm, 1000);
    } else {
        console.log('❌ WebSocket Not Connected');
    }
});