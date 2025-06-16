import { throttle } from "lodash-es";

export default class WorkerPool {
    constructor(workerConstructor: new () => Worker, option?: {
        MaxTaskPerWorker?: number;
        MaxWorkerCount?: number;
    }) {
        this.workerConstructor = workerConstructor;
        this.MaxTaskPerWorker = option?.MaxTaskPerWorker ?? 5;
        this.MaxWorkerCount = option?.MaxWorkerCount ?? Infinity;
    }

    private workerConstructor: new () => Worker;
    private workerPool: Worker[] = [];
    private workerTaskMap: Map<number, { resolve: (f: File) => void, reject: (error: any) => void }> = new Map();
    private workerTaskCountMap = new WeakMap<Worker, number>();

    private MaxTaskPerWorker: number;
    private MaxWorkerCount: number;

    private get currTaskCount() {
        return this.workerTaskMap.size;
    }

    private newWorker() {
        if (this.workerPool.length >= this.MaxWorkerCount) {
            console.warn('Worker pool is full, cannot create new worker');
            return;
        }
        const newWorker = new this.workerConstructor();
        newWorker.onmessage = (event) => {
            const { id } = event.data;
            const task = this.workerTaskMap.get(id);
            if (task) {
                task.resolve(event.data);
                this.workerTaskMap.delete(id);
                this.workerTaskCountMap.set(newWorker, this.workerTaskCountMap.get(newWorker)! - 1);
                this.terminateInactivityWorker();
            } else {
                console.warn(`No task found for worker message with id: ${id}`);
            }
        };
        this.workerPool.push(newWorker);
        this.workerTaskCountMap.set(newWorker, 0);
    }

    private getInactivityWorker() {
        if (this.workerPool.length === 0 || this.currTaskCount % this.MaxTaskPerWorker === 0) {
            this.newWorker();
        }
        // 选择任务数量未达到上限且任务数最多的Worker执行，方便后续对不活跃Worker进行清理
        return this.workerPool.sort((a, b) => {
            const countA = this.workerTaskCountMap.get(a)!;
            const countB = this.workerTaskCountMap.get(b)!;
            return -(countA - countB);
        }).filter(worker => this.workerTaskCountMap.get(worker)! < this.MaxTaskPerWorker)[0]!;
    }

    private terminateInactivityWorker = throttle(() => {
        this.workerPool.filter(w => this.workerTaskCountMap.get(w) === 0).forEach(worker => {
            worker.terminate();
            this.workerPool = this.workerPool.filter(w => w !== worker);
            this.workerTaskCountMap.delete(worker);
        });
    }, 1000, {
        trailing: true,
    });

    public terminate() {
        this.workerPool.forEach(worker => worker.terminate());
        this.workerTaskMap.forEach((task, id) => {
            task.reject(new Error(`Worker terminated before task completion: ${id}`));
        });
        this.workerPool = [];
        this.workerTaskMap.clear();
    }

    public postMessage(message: { [k: string]: any }) {
        const id = Math.random();
        const worker = this.getInactivityWorker();
        return new Promise<any>((resolve, reject) => {
            this.workerTaskMap.set(id, { resolve, reject });
            this.workerTaskCountMap.set(worker, this.workerTaskCountMap.get(worker)! + 1);
            worker.postMessage({ ...message, id });
        });
    }
}