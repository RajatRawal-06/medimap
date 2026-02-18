export class PriorityQueue<T> {
    private items: { element: T; priority: number }[];

    constructor() {
        this.items = [];
    }

    enqueue(element: T, priority: number) {
        const queueElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(queueElement);
        }
    }

    dequeue(): T | undefined {
        return this.items.shift()?.element;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}
