/**
 * Compile实现解析和绑定的工作
 * 1. 解析模版指令，并替换模版数据，初始化视图
 * 2. 将模版指令对应的节点绑定对应的更新函数，初始化相应的订阅器dep
 */
class Compile{
    /**
     * @param el: 绑定的HTML元素的名字，仿照了vue的「el: '#app'」
     * @param vm: 要绑定的thisVue对象
     *  */
    constructor(el, vm) {
        this.vm = vm;
        this.el = document.querySelector(el);
        this.fragment = null;
        this.init();
    }
    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    }
    /**
     * 为了解析模版，需要获取dom元素，然后对dom元素上含有指令的节点进行处理
     * 因为dom操作频繁，先建立一个fragment片段，把需要解析的dom存入fragment片段并处理
     * 
     * DocumentFragments 是DOM节点。它们不是主DOM树的一部分。
     * 通常的用例是创建文档片段，将元素附加到文档片段，然后将文档片段附加到DOM树。
     * 在DOM树中，文档片段被其所有的子元素所代替。
     * 
     * 因为文档片段存在于内存中，并不在DOM树中，
     * 所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。
     * 因此，使用文档片段通常会带来更好的性能。
     * 
     * @param el: 获取的dom元素
     */
    nodeToFragment(el) {
        const fragment = document.createDocumentFragment();
        const child = el.firstChild;
        while (child) {
            console.log(child);
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    }
    /**
     * 对于节点中的 {{name}} 形式进行处理
     * 获取到最外层节点之后，调用compileElement函数判断子节点
     * 如果节点是文本节点并且匹配{{}}这种形式就进行编译处理
     * 
     * 编译处理的时候首先初始化视图数据，之后生成并绑定一个更新函数的订阅器
     * 这样就完成了指令的解析、初始化、编译三个过程
     * @param el: 获取的dom元素
     */
    compileElement(node) {
        const childNodes = node.childNodes;
        [].slice.call(childNodes).forEach((node) => {
            const reg = /\{\{(.*?)\}\}/;
            const text = node.textContent;

            if (this.isElementNode(node)) {  
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                text.match(reg).forEach((propertyName) => {
                    this.compileText(node, propertyName);
                })
            }

            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);  // 继续递归遍历子节点
            }
        });
    }
    /**
     * @param node: 绑定的dom元素节点
     * @param propertyName: 指的是属性值的名称，在本例中是‘name’
     *  */
    compileText(node, propertyName) {
        const initText = this.vm.data[propertyName];
        this.updateText(node, initText);  // 将初始化的数据初始化到视图中
        new Watcher(this.vm, propertyName, (value) => { // 生成订阅器并绑定更新函数
            this.updateText(node, value);
        });
    }
    compile(node) {
        const nodeAttrs = node.attributes;
        nodeAttrs.forEach((attr) => {
            const attrName = attr.name;
            if (this.isDirective(attrName)) {
                const propertyName = attr.value;
                const dir = attrName.substring(2);
                if (this.isEventDirective(dir)) {  // 事件指令
                    this.compileEvent(node, this.vm, propertyName, dir);
                } else {  // v-model 指令
                    this.compileModel(node, this.vm, propertyName, dir);
                }
                node.removeAttribute(attrName);
            }
        });
    }
    compileEvent(node, vm, propertyName, dir) {
        const eventType = dir.split(':')[1];
        const cb = vm.methods && vm.methods[propertyName];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    }
    compileModel(node, vm, propertyName, dir) {
        const val = this.vm[propertyName];
        this.modelUpdater(node, val);
        new Watcher(this.vm, propertyName, function (value) {
            this.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            const newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            this.vm[propertyName] = newValue;
            val = newValue;
        });
    }
    updateText(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
    modelUpdater(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
    isDirective(attr) {
        return attr.indexOf('v-') == 0;
    }
    isEventDirective(dir) {
        return dir.indexOf('on:') === 0;
    }
    isElementNode(node) {
        return node.nodeType == 1;
    }
    isTextNode(node) {
        return node.nodeType == 3;
    }
}