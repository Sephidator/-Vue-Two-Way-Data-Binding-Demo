class Watcher {
    /**
     * @param vm: 要绑定的SelfVue对象
     * @param exp: 不知道是什么的缩写，指的是属性值的名称，在本例中是‘name’
     * @param cb: 修改了值过后的回调函数
     *  */
    constructor(vm, exp, cb) {
        this.cb = cb;
        this.vm = vm;
        this.exp = exp;
        this.value = this.subscribe();  // 将自己添加到订阅器的操作
    }
    update() {
        this.run();
    }
    run() {
        const value = this.vm.data[this.exp];
        const oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    }
    /**
     * 订阅者Watcher在初始化的时候把自己添加到订阅器Dep当中
     * 监听器Observer在get函数的时候会执行添加Watcher的操作（Dep.target一句）
     * 于是调用一次get函数来取得数据
     * */
    subscribe() {
        Dep.target = this;  // 缓存自己
        const value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
        Dep.target = null;  // 释放自己
        return value;
    }
}