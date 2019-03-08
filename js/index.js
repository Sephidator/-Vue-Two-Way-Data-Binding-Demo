class SelfVue {
    /**
     * @param data: 要绑定的model对象，是相当于Vue对象中return的data
     * @param el: 绑定的HTML元素
     * @param exp: 不知道是什么的缩写，指的是属性值的名称，在本例中是‘name’
     *  */
    constructor(data, el, exp) {
        this.data = data;

        Object.keys(data).forEach((key) => {
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

        observe(data);
        el.innerHTML = this.data[exp];  // 初始化模板数据的值
        new Watcher(this, exp, (value) => {
            el.innerHTML = value;
        });
    }
}