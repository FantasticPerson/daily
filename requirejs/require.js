(function (root) {
    var modMap = {} //缓存 模块的名称 依赖 接口对象
    //初始化
    var requireUse = function (deps, callback) {
        if (deps.length === 0) {
            callback()
        }
        var depLen = deps.length
        var params = []
        for (var i = 0; i < depLen; i++) {
            (function (j) {
                loadMod(deps[j], function (options) {
                    depLen--;
                    params[j] = options //接口对象
                    if(depLen ==0){
                        callback.apply(null,params)
                    }
                })
                console.log(j)
            })(i)
            console.log(deps[i])
        }
    }
    //定义模块
    var define = function (name, deps, callback) {
        modMap[name] = modMap[name] || {}
        modMap[name].deps = deps
        modMap[name].status = 'loaded'
        modMap[name].callback = callback //用来获取接口对象
    }
    var loadMod = function (name, callback) {
        if (!modMap[name]) {//如果缓存中没有当前这个模块
            modMap[name] = {
                status: 'loading'
            }
            //加载模块
            loadScript(name, function () {
                requireUse(modMap[name].deps, function () {
                    //执行要加载的模块
                    execMod(name, callback)
                })
            })
        }
    }

    var execMod = function (name, callback) {
        var options = modMap[name].callback()
        modMap[name].exports = options
        callback(options)
    }

    //注入script
    var loadScript = function (name, callback) {
        var doc = document
        var node = doc.createElement('script')
        node.src = name + '.js'
        doc.body.appendChild(node)
        node.onload = function () {
            callback()
        }
    }

    root.requireUse = requireUse
    root.define = define
})(this)