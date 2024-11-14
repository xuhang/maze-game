class Maze {
    constructor(width, height) {
        this.width = width % 2 === 0 ? width + 1 : width;
        this.height = height % 2 === 0 ? height + 1 : height;
        this.grid = [];
        this.init();
    }

    init() {
        // 初始化迷宫网格
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // 1表示墙，0表示路
            }
        }
        
        // 使用深度优先搜索生成迷宫
        this.generateMaze(1, 1);
    }

    generateMaze(x, y) {
        this.grid[y][x] = 0;
        
        // 定义四个方向：上、右、下、左
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ];
        
        // 随机打乱方向
        directions.sort(() => Math.random() - 0.5);
        
        // 向四个方向探索
        for (let [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                this.grid[newY][newX] === 1) {
                    this.grid[y + dy/2][x + dx/2] = 0;
                    this.grid[newY][newX] = 0;
                    this.generateMaze(newX, newY);
            }
        }
    }
}