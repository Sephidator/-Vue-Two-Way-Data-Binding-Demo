class SelfVue {
    /**
     * 在SelfVue中将Compiler和Observer、Watcher关联起来
     * options格式如下所示：
     * 
     * const selfVue = new SelfVue({
     *     el: "#app",
     *     data: {
     *         title: 'hello world',
     *         name: ''
     *     }
     * })
     *  */
    constructor(options) {
        this.data = options.data;
        this.methods = options.methods;

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
        observe(this.data);
        new Compile(options.el, this);
        options.mounted.call(this);  // 所有事情处理好后调用mounted函数
    }
}