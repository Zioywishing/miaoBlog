import { throttle } from "lodash-es";

export default class WorkerPool {
    /**
     * WorkerPool模式：尽可能创建更多的Worker
     */
    public static MODE_MoreWorker = Symbol('MoreWorker');

    /**
     * WorkerPool模式：尽可能让已有Worker忙
     */
    public static MODE_BusyWorker = Symbol('BusyWorker');

    constructor(workerConstructor: new () => Worker, option?: {
        MaxTaskPerWorker?: number;
        MaxWorkerCount?: number;
        MinWorkerCount?: number;
        Mode?: typeof WorkerPool.MODE_MoreWorker | typeof WorkerPool.MODE_BusyWorker;
    }) {
        this.workerConstructor = workerConstructor;
        this.MaxTaskPerWorker = option?.MaxTaskPerWorker ?? 2;
        this.MaxWorkerCount = option?.MaxWorkerCount ?? 16;
        this.MinWorkerCount = option?.MinWorkerCount ?? 0;
        this.mode = option?.Mode ?? WorkerPool.MODE_MoreWorker;
        new Array(this.MinWorkerCount).fill(null).forEach(() => {
            this.newWorker();
        });
    }

    private workerConstructor: new () => Worker;
    private workerPool: Worker[] = [];
    private workerTaskMap: Map<number, { resolve: (...args: any[]) => void, reject: (error: any) => void }> = new Map();
    private workerTaskCountMap = new WeakMap<Worker, number>();

    private taskRequestBuffer: {
        message: { [k: string]: any },
        transfer: Transferable[]
    }[] = [];

    private MaxTaskPerWorker: number;
    private MaxWorkerCount: number;
    private MinWorkerCount: number;

    private mode: typeof WorkerPool.MODE_MoreWorker | typeof WorkerPool.MODE_BusyWorker;
    private _idCounter = 0;

    private get isWorkerAllBusy() {
        return this.workerPool.every(worker => this.workerTaskCountMap.get(worker)! >= this.MaxTaskPerWorker);
    }

    private get isPoolFull() {
        return this.workerPool.length >= this.MaxWorkerCount;
    }

    private getAvailableWorker() {
        if (this.workerPool.length === 0 || (this.mode === WorkerPool.MODE_BusyWorker ? this.isWorkerAllBusy : !this.isPoolFull)) {
            if (this.mode === WorkerPool.MODE_BusyWorker && this.isPoolFull) {
                return null;
            }
            this.newWorker();
        }
        if (this.mode === WorkerPool.MODE_MoreWorker && this.isWorkerAllBusy) {
            return null;
        }

        // 性能差不多行了
        this.workerPool.sort((a, b) => {
            const countA = this.workerTaskCountMap.get(a)!;
            const countB = this.workerTaskCountMap.get(b)!;
            return countA - countB;
        });

        return this.mode === WorkerPool.MODE_BusyWorker
            ? (this.workerPool.filter(worker => this.workerTaskCountMap.get(worker)! < this.MaxTaskPerWorker).toReversed()[0] || null)
            : this.workerPool[0];
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
                if (this.taskRequestBuffer.length > 0) {
                    const request = this.taskRequestBuffer.shift()!;
                    newWorker.postMessage(request.message, request.transfer);
                    // console.log(`WorkerPool: Task from buffer sent to worker, current task request buffer length: ${this.taskRequestBuffer.length}`);
                } else {
                    this.workerTaskCountMap.set(newWorker, this.workerTaskCountMap.get(newWorker)! - 1);
                }
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
        const inactivityWorkers = this.workerPool.filter(worker => this.workerTaskCountMap.get(worker) === 0)
        for (const worker of inactivityWorkers) {
            if (this.workerPool.length <= this.MinWorkerCount) {
                break;
            }
            worker.terminate();
            this.workerPool = this.workerPool.filter(w => w !== worker);
            this.workerTaskCountMap.delete(worker);
        }
        // console.log(`WorkerPool: Inactivity workers terminated, current worker count: ${this.workerPool.length}`);
    }, 500, {
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

    public postMessage(message: { [k: string]: any }, transfer?: Transferable[]): Promise<any> {
        const id = this._idCounter++;
        const worker = this.getAvailableWorker();
        return new Promise<any>((resolve, reject) => {
            this.workerTaskMap.set(id, { resolve, reject });
            if (worker) {
                this.workerTaskCountMap.set(worker, this.workerTaskCountMap.get(worker)! + 1);
                worker.postMessage({ ...message, id }, transfer ?? []);
            } else {
                this.taskRequestBuffer.push({ message: { ...message, id }, transfer: transfer ?? [] });
            }
        });
    }
}