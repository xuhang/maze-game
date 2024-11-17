class MazeGame {
    constructor() {
        this.COLORS = {
            WALL: '#B22222',      // 砖红色
            WALL_SHADOW: '#8B0000', // 深砖红色
            PATH: '#f0e68c',      // 路径颜色
            EXIT: '#90F'          // 出口颜色
        };

        this.currentLevel = 1;
        this.maxLevel = 50;
        this.levelHistory = [];
        this.startTime = null;
        this.timerInterval = null;
        
        // 创建绑定到实例的事件处理函数
        this.handleKeydown = this.handleKeydown.bind(this);
        
        this.initGame();
        this.initUI();
        
        // 在构造函数中只绑定一次事件监听器
        document.addEventListener('keydown', this.handleKeydown);
    }

    initGame() {
        // 确保迷宫尺寸为奇数
        const baseSize = 21; // 基础尺寸
        const levelIncrease = Math.floor((this.currentLevel - 1) / 5) * 2; // 每5关增加的尺寸
        const mazeSize = baseSize + levelIncrease;
        
        this.maze = new Maze(mazeSize, mazeSize);
        this.playerPos = this.getRandomStartPosition();
        this.viewRadius = 2;
        this.exit = this.setExit();
        
        this.previewCanvas = document.getElementById('preview-canvas');
        this.gameCanvas = document.getElementById('game-canvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.gameCtx = this.gameCanvas.getContext('2d');
        
        this.cellSize = 20;
        this.setupCanvas();
    }

    initUI() {
        this.updateLevelDisplay();
        this.updateLevelHistory();
    }

    updateLevelDisplay() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
    }

    updateLevelHistory() {
        const historyContainer = document.getElementById('level-history');
        historyContainer.innerHTML = this.levelHistory.map((record, index) => `
            <div class="level-record">
                Level ${index + 1}: ${record}
            </div>
        `).join('');
    }

    startTimer() {
        this.startTime = Date.now();
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        return this.formatTime((Date.now() - this.startTime) / 1000);
    }

    updateTimer() {
        const currentTime = (Date.now() - this.startTime) / 1000;
        document.getElementById('timer').textContent = this.formatTime(currentTime);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            this.initGame();
            this.start();
        } else {
            alert('Congratulations! You have completed all levels!');
        }
    }

    start() {
        document.getElementById('preview-screen').style.display = 'flex';
        document.getElementById('preview-screen').style.justifyContent = 'center';
        document.getElementById('game-screen').style.display = 'none';
        
        this.drawFullMaze();
        let countdown = 12;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown === 0) {
                clearInterval(timer);
                document.getElementById('preview-screen').style.display = 'none';
                document.getElementById('game-screen').style.display = 'flex';
                document.getElementById('game-screen').style.justifyContent = 'center';
                this.drawPlayerView();
                this.startTimer();
            }
        }, 1000);
    }

    checkWin() {
        if (this.playerPos.x === this.exit.x && this.playerPos.y === this.exit.y) {
            const timeSpent = this.stopTimer();
            this.levelHistory.push(timeSpent);
            this.updateLevelHistory();
            
            setTimeout(() => {
                this.showLevelCompleteMessage(`Level ${this.currentLevel} completed! Time: ${timeSpent}`);
                this.nextLevel();
            }, 100);
        }
    }

    showLevelCompleteMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'level-complete-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 3秒后自动移除提示
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupCanvas() {
        // 设置画布大小
        this.previewCanvas.width = this.maze.width * this.cellSize;
        this.previewCanvas.height = this.maze.height * this.cellSize;
        this.gameCanvas.width = this.maze.width * this.cellSize;
        this.gameCanvas.height = this.maze.height * this.cellSize;
    }

    getRandomStartPosition() {
        // 确保起始位置在路径上
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.maze.width - 2)) + 1;
            y = Math.floor(Math.random() * (this.maze.height - 2)) + 1;
        } while (this.maze.grid[y][x] !== 0);
        
        return {x, y};
    }

    setExit() {
        // 在边界上寻找一个与路径相连的位置作为出口
        const side = Math.random() < 0.5 ? 'right' : 'bottom';
        let x, y;
        
        if (side === 'right') {
            x = this.maze.width - 1;
            // 找到右边界第一个与路径相连的位置
            for (y = 1; y < this.maze.height - 1; y++) {
                if (this.maze.grid[y][this.maze.width - 2] === 0) {
                    break;
                }
            }
        } else {
            y = this.maze.height - 1;
            // 找到下边界第一个与路径相连的位置
            for (x = 1; x < this.maze.width - 1; x++) {
                if (this.maze.grid[this.maze.height - 2][x] === 0) {
                    break;
                }
            }
        }
        
        this.maze.grid[y][x] = 0; // 确保出口是通路
        return {x, y};
    }

    loadBrickPattern() {
        // 创建砖块纹理模式
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        const patternSize = 20; // 砖块大小

        patternCanvas.width = patternSize;
        patternCanvas.height = patternSize;

        // 绘制砖块底色
        patternCtx.fillStyle = this.COLORS.WALL;
        patternCtx.fillRect(0, 0, patternSize, patternSize);

        // 绘制砖块纹理
        patternCtx.strokeStyle = this.COLORS.WALL_SHADOW;
        patternCtx.lineWidth = 1;

        // 水平线
        patternCtx.beginPath();
        patternCtx.moveTo(0, patternSize/2);
        patternCtx.lineTo(patternSize, patternSize/2);
        patternCtx.stroke();

        // 垂直线（交错排列）
        patternCtx.beginPath();
        patternCtx.moveTo(patternSize/2, 0);
        patternCtx.lineTo(patternSize/2, patternSize);
        patternCtx.stroke();

        // 创建图案
        this.brickPattern = this.previewCtx.createPattern(patternCanvas, 'repeat');
    }

    drawBrick(ctx, x, y, size) {
        // 绘制单个砖块
        ctx.fillStyle = this.COLORS.WALL;
        ctx.fillRect(x, y, size, size);

        // 添加砖块纹理
        ctx.strokeStyle = this.COLORS.WALL_SHADOW;
        ctx.lineWidth = 1;

        // 水平缝隙
        ctx.beginPath();
        ctx.moveTo(x, y + size/2);
        ctx.lineTo(x + size, y + size/2);
        ctx.stroke();

        // 垂直缝隙（考虑偏移）
        const offset = Math.floor(y / size) % 2 === 0 ? 0 : size/2;
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset, y + size);
        ctx.stroke();

        // 添加阴影效果
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y + size - 2, size, 2);
        ctx.fillRect(x + size - 2, y, 2, size);
    }

    drawFullMaze() {
        // 清空画布
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // 绘制背景
        this.previewCtx.fillStyle = this.COLORS.PATH;
        this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // 绘制迷宫
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const cellX = x * this.cellSize;
                const cellY = y * this.cellSize;
                
                if (x === this.exit.x && y === this.exit.y) {
                    // 绘制出口
                    this.previewCtx.fillStyle = this.COLORS.EXIT;
                    this.previewCtx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    // 添加出口标记边框
                    this.previewCtx.strokeStyle = '#fff';
                    this.previewCtx.lineWidth = 2;
                    this.previewCtx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                } else if (this.maze.grid[y][x] === 1) {
                    // 绘制砖墙
                    this.drawBrick(this.previewCtx, cellX, cellY, this.cellSize);
                }
            }
        }
    }

    drawPlayerView() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        
        // 绘制可见区域
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                if (Math.abs(x - this.playerPos.x) <= this.viewRadius && 
                    Math.abs(y - this.playerPos.y) <= this.viewRadius) {
                    const cellX = x * this.cellSize;
                    const cellY = y * this.cellSize;
                    
                    if (x === this.exit.x && y === this.exit.y) {
                        // 绘制出口
                        this.gameCtx.fillStyle = this.COLORS.EXIT;
                        this.gameCtx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                        this.gameCtx.strokeStyle = '#fff';
                        this.gameCtx.lineWidth = 2;
                        this.gameCtx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                    } else if (this.maze.grid[y][x] === 1) {
                        // 绘制砖墙
                        this.drawBrick(this.gameCtx, cellX, cellY, this.cellSize);
                    } else {
                        // 绘制路径
                        this.gameCtx.fillStyle = this.COLORS.PATH;
                        this.gameCtx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    }
                }
            }
        }
        
        // 绘制玩家
        this.gameCtx.fillStyle = 'red';
        this.gameCtx.beginPath();
        this.gameCtx.arc(
            this.playerPos.x * this.cellSize + this.cellSize/2,
            this.playerPos.y * this.cellSize + this.cellSize/2,
            this.cellSize/3,
            0,
            Math.PI * 2
        );
        this.gameCtx.fill();
    }

    // 将事件处理逻辑分离为独立方法
    handleKeydown(e) {
        if (e.repeat) return; // 防止按住键盘重复触发
        
        let newX = this.playerPos.x;
        let newY = this.playerPos.y;
        
        switch(e.key) {
            case 'ArrowUp': newY--; break;
            case 'ArrowDown': newY++; break;
            case 'ArrowLeft': newX--; break;
            case 'ArrowRight': newX++; break;
            default: return;
        }
        
        if (newX >= 0 && newX < this.maze.width && 
            newY >= 0 && newY < this.maze.height && 
            this.maze.grid[newY][newX] === 0) {
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.drawPlayerView();
            this.checkWin();
        }
    }
}

// 启动游戏
window.onload = () => {
    const game = new MazeGame();
    game.start();
};