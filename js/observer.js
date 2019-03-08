/**
 * 监听器Observer
 * 劫持并监听所有的属性，如果有变动的，会通知订阅者Watcher
 * 递归遍历所有的属性值，并对其进行 Object.defineProperty()处理
 * */
class Observer {
    constructor(data) {
        this.data = data;
        this.addObserver(data);
    }
    addObserver(data) {
        Object.keys(data).forEach((key) => {
            this.defineReactive(data, key, data[key]);
        });
    }
    defineReactive(data, key, val) {
        var dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: (newVal) => {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();
            }
        });

        observe(val);
    }
}

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};

/**
 * 消息订阅器Dep
 * 可以容纳订阅者，放在subs这个数组中
 * 主要负责收集订阅者，并在属性变化的时候执行订阅者的update函数
 */
class Dep {
    static target = null;
    subs = [];

    addSub(sub) {
        this.subs.push(sub);
    }
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        });
    }
}
