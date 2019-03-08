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
        /**
         * 注意看下面的代码
         * 对于每个属性（val = data[key]），都会产生一个dep实例
         * 也就是说如果待观察的对象有很多个属性，就会产生很多个实例
         * 但是每个实例会共享静态域Dep.target
         * 
         * 于是就可以看Watcher的subscribe方法
         * subscribe() {
         *     Dep.target = this;  // 缓存自己
         *     const value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
         *     Dep.target = null;  // 释放自己
         *     return value;
         * }
         * 先设置Dep.target，然后强制执行get方法，于是下面的
         * if (Dep.target) {
         *     dep.addSub(Dep.target);
         * }
         * 这一段就会给当前的dep实例的subs添加上一个sub
         * 之后清楚Dep.target，去除影响
         * Dep.target和dep实例指向的都是这个watcher实例
         * 
         * 当被observe的数据被设置新的值的时候，就会调用这个watcher的update方法
         * 本例子中唯一一次使用watcher是在index.js当中，然后这个watchaer实例涉及到的dep实例和只有一个
         * 也就是说实际上有很多个dep实例根本没有被使用到，因为在if判断的时候Dep.target == null
         */
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
                // 在Observer中对于节点修改了值之后，会调用dep的更新方法
                // 然后dep中的sub（sub是一个watcher实例）会调用update()方法
                dep.notify();
            }
        });

        // 对子节点的递归操作
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
