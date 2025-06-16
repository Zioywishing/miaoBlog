import { throttle } from "lodash-es";

export default class WorkerPool {
    constructor(workerConstructor: new () => Worker, option?: {
        MaxTaskPerWorker?: number;
        MaxWorkerCount?: number;
        MinWorkerCount?: number;
    }) {
        this.workerConstructor = workerConstructor;
        this.MaxTaskPerWorker = option?.MaxTaskPerWorker ?? 5;
        this.MaxWorkerCount = option?.MaxWorkerCount ?? Infinity;
        this.MinWorkerCount = option?.MinWorkerCount ?? 0;
        new Array(this.MinWorkerCount).fill(null).forEach(() => {
            this.newWorker();
        });
    }

    private workerConstructor: new () => Worker;
    private workerPool: Worker[] = [];
    private workerTaskMap: Map<number, { resolve: (f: File) => void, reject: (error: any) => void }> = new Map();
    private workerTaskCountMap = new WeakMap<Worker, number>();

    private MaxTaskPerWorker: number;
    private MaxWorkerCount: number;
    private MinWorkerCount: number;

    private get isWorkerAllBusy() {
        return this.workerPool.every(worker => this.workerTaskCountMap.get(worker)! >= this.MaxTaskPerWorker);
    }

    private getInactivityWorker() {
        if (this.workerPool.length === 0 || this.isWorkerAllBusy === true) {
            this.newWorker();
        }
        // 选择任务数量未达到上限且任务数最多的Worker执行，方便后续对不活跃Worker进行清理
        const sortedWorkers = this.workerPool.sort((a, b) => {
            const countA = this.workerTaskCountMap.get(a)!;
            const countB = this.workerTaskCountMap.get(b)!;
            return -(countA - countB);
        });
        // 找到任务数未达到上限的任务数最多的Worker，若没有则说明已达到worker池的容量上限，故返回任务数最少的Worker
        return sortedWorkers.find(worker => this.workerTaskCountMap.get(worker)! < this.MaxTaskPerWorker) ?? sortedWorkers[sortedWorkers.length - 1];
    }

    private newWorker() {
        if (this.workerPool.length >= this.MaxWorkerCount) {
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
                console.error(`WorkerPool: No task found for worker message with id: ${id}`);
            }
        };
        this.workerPool.push(newWorker);
        this.workerTaskCountMap.set(newWorker, 0);

        // console.log(`WorkerPool: New worker created, current worker count: ${this.workerPool.length}`);
    }

    private terminateInactivityWorker = throttle(() => {
        if (this.workerPool.length <= this.MinWorkerCount) {
            return;
        }
        const InactivityWorkers = this.workerPool.filter(worker => this.workerTaskCountMap.get(worker) === 0)
        for (const worker of InactivityWorkers) {
            if (this.workerPool.length <= this.MinWorkerCount) {
                return;
            }
            worker.terminate();
            this.workerPool = this.workerPool.filter(w => w !== worker);
            this.workerTaskCountMap.delete(worker);
        }
        // console.log(`WorkerPool: Inactivity workers terminated, current worker count: ${this.workerPool.length}`);
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