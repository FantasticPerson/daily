(function (root) {
    var push = Array.prototype.push
    var nativeKeys = Object.keys
    var ObjProto = Object.prototype
    var _ = function (obj) {

        if (!(this instanceof _)) {
            return new _(obj)
        }
        this.wrap = obj
    }

    typeof module != "undefined" && module.exports ? module.exports = _ : root._ = _
    if (typeof define === 'function' && define.amd) {
        define("underscore", [], function () {
            return {
                _: _
            }
        })
    }

    _.uniq = function (array, callback) {
        var result = []
        for (var i = 0; i < array.length; i++) {
            var computed = callback ? callback(array[i]) : array[i]
            if (result.indexOf(computed) < 0) {
                result.push(computed)
            }
        }
        return result
    }

    _.functions = function (obj) {
        var result = []
        var key
        for (key in obj) {
            result.push(key)
        }
        return result
    }

    _.each = function (target, callback) {
        var key, i = 0
        if (_.isArray(target)) {
            var length = target.length
            for (; i < length; i++) {
                callback.call(target, target[i], i)
            }
        } else {
            for (key in target) {
                callback.call(target, target[key], key)
            }
        }
    }

    //开启链接是的调用
    _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true //标识当前示例支持链接式调用
        return instance
    }

    //辅助函数 用来判断返回结果是否符合链接式调用 result(实例对象 处理好的结果)
    var result = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj  //  chain 的参数  会在  mixin 中传过去
    }

    // obj 目标源 必须
    // iteratee 迭代器 不仅仅是函数 选择
    // context 上下文对象 选择
    _.map = function (obj, iteratee, context) {
        //生成不同的迭代器
        var iterator = cb(iteratee, context)
        var keys = !_.isArray(obj) && _.keys(obj)
        var length = (keys || obj).length
        var result = Array(length)
        for (var index = 0; index < length; index++) {
            //object 属性的值 属性 array下标
            var currentKeys = keys ? keys[index] : index;
            result[index] = iterator(obj[currentKeys], index, obj)
        }
        return result
    }

    //hasEnumbug IE 以下
    var hasEnumbug = !{ valueOf: null }.propertyIsEnumerable('valueOf')
    var noEnumerableProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf']
    var collect = function (obj, keys) {
        var npLength = noEnumerableProperties.length
        var constructor = obj.constructor
        var proto = constructor.prototype || ObjProto

        for (var i = 0; i < npLength; i++) {
            var key = noEnumerableProperties[i]
            if (key in obj && obj[key] !== proto[key]) {
                keys.push(key)
            }
        }
    }
    _.keys = function (obj) {
        //允许出现错误
        if (!_.isObject(obj)) { return [] }
        if (nativeKeys) {
            return nativeKeys(obj)
        }
        var keys = []
        for (var key in obj) {
            keys.push(key)
        }
        // IE9 以下 for in 有兼容性问题 TODO
        if (hasEnumbug) {
            collection(obj, keys)
        }
        return keys
    }



    var cb = function (iteratee, context, args) {
        if (iteratee == null) {
            return _.identity
        }
        if (_.isFunction(iteratee)) {
            return _.optimizeCb(iteratee, context, args)
        }
    }

    _.identity = function (value) {
        return value
    }

    //优化回调
    _.optimizeCb = function (func, context, args) {
        if (context == void 0) {
            return func
        }
        switch (args == null ? 3 : args) {
            //1,2,3,4
            case 1: return function (value) {
                return func.call(context, value)
            }
            case 3: return function (value, index, obj) {
                return func.call(context, value, index, obj)
            }
            case 4: return function (memo, value, index, obj) {
                return func.call(context, memo, value, index, obj)
            }
        }
    }

    _.times = function (n, iteratee, context) {
        var result = Array(Math.max(0, n))
        iteratee = this.optimizeCb(iteratee, context, 1)
        for (var i = 0; i < result.length; i++) {
            result[i] = iteratee(i)
        }
        return result
    }

    _.prototype.value = function () {
        return this.wrap
    }

    _.isArray = function (array) {
        return toString.call(array) === "[object Array]"
    }
    _.each(["Function", "String", "Object", "Number"], function (name) {
        _["is" + name] = function (obj) {
            return toString.call(obj) === "[object " + name + "]"
        }
    })
    //类型检测

    var createReduce = function (dir) {
        //实现累加
        var reduce = function (obj, iteratee, memo, init) {
            var keys = !_.isArray(obj) && _.keys(obj)
            var length = (keys || obj).length
            var index = dir > 0 ? 0 : length - 1
            if (!init) {
                memo = obj[keys ? keys[index] : index]
                index += dir
            }
            for (; index >= 0 && index < length; index += dir) {
                var key = keys ? keys[index] : index
                memo = iteratee(memo, obj[key], key, obj)
            }
            return memo
        }
        return function (obj, iteratee, memo, context) {
            var init = arguments.length >= 3
            return reduce(obj, _.optimizeCb(iteratee, context, 4), memo, init)
        }
    }
    //createReduce 工厂函数 生成 reduce
    _.reduce = createReduce(1) // 1 / -1 表顺序  从前往后  还是从后往前

    //柯里化
    _.restArgs = function (fn) {
        return function () {
            //arguments 实参
            var argsLength = fn.length //参数的个数
            var startIndex = argsLength - 1
            //为 rest参数开辟数组存储实参
            var args = Array(argsLength)
            var rest = Array.prototype.slice.call(arguments, startIndex)
            // 单一 参数的处理
            for (var i = 0; i < startIndex; i++) {
                args[i] = arguments[i]
            }
            args[startIndex] = rest
            return fn.apply(this, args)
        }
    }

    function createEscaper(map) {
        var escaper = function (caper) {
            return map[caper];
        }
        var exp = '(?:' + _.keys(map).join('|') + ')'
        var testExp = new RegExp(exp)
        var replaceExp = new RegExp(exp, 'g')

        return function (string) {
            string = string == null ? '' : string
            return testExp.test(string) ? string.replace(replaceExp, escaper) : string
        }
    }

    _.invert = function (obj) {
        var result = {}
        var keys = _.keys(obj)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            result[obj[key]] = key
        }
        return result
    }

    //字符串逃逸
    _.escaper = createEscaper(escapeMap)

    //字符串发逃逸
    _.unescaper = createEscaper(unescapeMap)

    _.extend = function () {
        var target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            option,
            key
        if (typeof target !== 'object') {
            target = {}
        }
        for (; i < length; i++) {
            if ((option = arguments[i]) != null) {
                for (key in option) {
                    target[key] = option[key]
                }
            }
        }
        return target
    }

    //需要逃逸的字符
    var escapeMap = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": '&apos;',
        '"': '&quot;'
    }

    var unescapeMap = _.invert(escapeMap)

    _.templateSetting = {
        evalute: /<%([\s\S]+?)%>/, //逻辑
        interpolate: /<%=([\s\S]+?)%>/,//变量
        escape: /<%-([\s\S]+?)%>/ //需要逃逸的字符
    }

    var escapes = {
        "'": "\\'",
        "\\": "\\",
        "\r": "r",
        "\n": "n"
    }

    var escaperExp = /\\||'|\r|\n/
    var escapeChar = function (match) {
        return '\\' + escapes[match]
    }
    /** 
     * 模板引擎
     * text 模板字符串
     * settings 自定义配置
    */
    _.template = function (text, setting) {
        //extend
        settings = _.templateSetting
        var matcher = RegExp([
            settings.interpolate.source,
            settings.escape.source,
            settings.evalute.source,
        ].join("|"), 'g')

        //source 字符串保存函数
        var source = "_p+="
        var index = 0
        text.replace(matcher, function (match, interpolate, escape, evalute, offset) {
            console.log(text.slice(index, offset))
            source += text.slice(index, offset)
            console.log(source)
            index = offset + match.length;
            if (interpolate) {
                console.log(interpolate)
                //(_t=interpolate ) == null ? " ":_t
                source += "'\n((_t=(" + interpolate + "))==null?'':_.escaper(_t))+\n'"
            } else if (escape) {
                source += "'\n((_t=(" + escape + "))==null?'':_t)+\n'"
            } else if (evalute) {
                source += "';\n" + evalute + "\n_p+='";
            }
        })
        source += "';"
        //with 限定作用域
        console.log(source)
        if (!settings.variable) source = '\nwith(obj||{}){\n' + source + '}\n'
        console.log(source)
        source = "var _t,p='';" + source + 'return _p;\n'
        //渲染函数
        console.log(source)
        var render = new Function("obj", '_', source)
        var template = function (data) {
            return render.call(this, data, _)
        }
        return template
    }

    _.values = function (obj) {
        var keys = _.keys(obj)
        var length = keys.length
        var values = Array(length)
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]]
        }
        return values
    }

    _.random = function (min, max) {
        if (max == null) {
            max = min
            min = 0
        }
        return min + Math.floor(Math.random() * (max - min + 1))
    }

    //洗牌 乱序
    _.shuffle = function (obj, length) {
        var set = _.isArray(obj) ? obj : _.values(obj)
        var length = set.length
        console.log(length)
        var shuffle = Array(length)

        for (var i = 0, rand; i < length; i++) {
            //生成一个随机数 1.整数 2.范围
            rand = _.random(0, i)
            shuffle[i] = shuffle[rand]
            shuffle[rand] = set[i]
        }

        return shuffle
    }

    _.now = Data.now || function () {
        return new Date().getTime()
    }

    _.debounce = function (fn, wait, n) {
        var args
        var timeout
        var time
        var later = function () {
            //获取时间戳
            var last = _.now() - time

            if (last < wait) {//还没有到达时间  继续设着定时器
                timeout = setTimeout(later, wait - last)
            } else {
                timeout = null
                if (!n) {
                    fn.apply(this, args)
                }
            }
        }
        //n为true时 立即调用处理函数
        return function () {
            args = arguments
            //获取调用时候的时间戳
            time = _.now()
            var callNow = n && !timeout
            //无论 callNow 是否有值都会设计一个定时器
            if (!timeout) {
                timeout = setTimeout(later, wait)
            }
            if (callNow) {
                fn.apply(this, arguments)
            }
        }
    }

    //节流函数
    _.throttle = function (fn, wait) {
        //标记上一次执行事件的时间戳
        var lastTime = 0
        var args
        var timeout = null
        var later = function(){
            lastTime = _.now()
            func.apply(this,args)
            timeout = null
            args = null
        }
        return function () {
            args = arguments
            //记录当前的时间戳
            var now = _.now()
            var remaining = wait-(now-lastTime) //剩余的时间
            if(remaining <=0){
                if(timeout){
                    clearTimeout(timeout)
                    timeout = null
                }
                //重置触发前一次的时间戳
                lastTime = now
                //调用处理函数
                fn.call(this,args)
                args = null
            } else if(!timeout) {
                timeout = setTimeout(later,ramaining)
            }
        }
    }

    //mixin _ 遍历 数组
    _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
            var func = obj[name]
            _.prototype[name] = function () {
                var args = [this.wrap] //【目标源】
                push.apply(args, arguments)
                return result(this, func.apply(this, args))
            }
        })
    }
    _.mixin(_)
})(this);