class SelfVue {
    /**
     * @param data: 要绑定的model对象，是相当于Vue对象中return的data
     * @param el: 绑定的HTML元素
     * @param exp: 不知道是什么的缩写，指的是属性值的名称，在本例中是‘name’
     * 
     * 在SelfVue中将Observer和Watcher关联起来，就可以实现一个简单的双向绑定
     *  */
    constructor(data, el, exp) {
        this.data = data;

        // 将对于selfVue.name的操作映射到selfVue.data.name上
        Object.keys(this.data).forEach((key) => {
            Object.defineProperty(this, key, {
                enumerable: false,
                configurable: true,
                get: () => {
                    return this.data[key];
                },
                set: (newVal) => {
                    this.data[key] = newVal;
                }
            });
        });

        /**
         * 通过observe方法，为data的每个属性以及属性的属性（递归）来使用Object.defineProperty进行劫持
         * 这样一来，set的时候会调用消息订阅器dep中的更新方法
         * */ 
        observe(data);

        el.innerHTML = this.data[exp];  // 初始化模板数据的值
        new Watcher(this, exp, (value, oldVal) => {
            console.log(oldVal);
            el.innerHTML = value;
        });
    }
}