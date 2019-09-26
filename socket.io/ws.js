/**
 * 使用方法 demo
 * import ws from '../../socket';
 * 按需订阅方法 ws.on(sub, callback)
 * 例子：ws.on(`{'event':'SUB','type':'ORDER_BOOK','product':'1001'}`, (data) => { })
*/
const Zlib = require('zlib.pretty');
const url = 'wss://onli-quotation.btcdo.com/v1/market/'
export default class {
    constructor() {
        this.ws = {}
        // 保证订阅成功后发送订阅
        this.clearTime = null
        // 订阅数组
        this.subList = []
        // 是否在重连
        this.reConnectTimer = null
        this.timer = null
        this.closeTimer = null
    }
    // 连接socket
    connection () {
        this.ws = new WebSocket(url);
        // 发送socket
        this.ws.onopen = () => {
            console.error('socket链接成功啦~~~')
        }
        // 返回message
        this.ws.onmessage = data => {
            if (data.data instanceof Blob) {
                this.transDataFun(data.data)
            }
        };
        // socket链接错误
        this.ws.onerror = () => {
            this.closeCheck()
            this.reConnection()
        };
        // socket关闭
        this.ws.onclose = error => {
            this.closeCheck()
            this.reConnection()
        }
    }
    // 心跳检测
    check () {
        this.ws.send('{\'event\':\'ping\'}')
        this.closeCheck()
        this.closeTimer = setTimeout(() => {
            this.ws.close()
        }, 1000);
        this.timer = setTimeout(() => {
            this.check()
        }, 30000)
    }
    // 关闭定时器
    closeCheck() {
        clearTimeout(this.timer)
        clearTimeout(this.closeTimer)
    }
    // 接收ping返回信息
    onPong(data) {
        if (data.event === 'pong') {
            clearTimeout(this.closeTimer)
        }
    }
    // 断线重连机制
    reConnection() {
        clearTimeout(this.reConnectTimer)
        if (this.ws.readyState === 1) return
        if (this.ws.readyState == 3) {
            this.connection()
        }
        this.reConnectTimer = setTimeout(() => {
            this.reConnection()
        }, 2000)
    }
    // 订阅数据
    on (params, callback) {
        !this.subList.includes(params) && this.subList.push(params)
        !!this.clearTime && clearTimeout(this.clearTime)
        if(this.ws.readyState !== 1) {
            this.clearTime = setTimeout(() => {
                this.on(params, callback)
            }, 1000);
            return;
        }
        this.subList.map(v => {
            this.ws.send(v)
            this.ws.onmessage = data => {
                if (data.data instanceof Blob) {
                    this.transDataFun(v, data.data, callback)
                }
            };
        })
    }
    // 数据处理
    transDataFun (sub, data, callback) {
        this.transData(data, (data) => {
            if(!sub.includes(data.type)) return
            !!callback && callback(data)
        })
    }
    // 处理blob数据
    transData (data, callback) => {
        let blob = data
        // js中的blob没有没有直接读出其数据的方法，通过FileReader来读取相关数据
        let reader = new FileReader()
        reader.readAsArrayBuffer(blob)
        // 当读取操作成功完成时调用.
        reader.onload = function(evt) {
            if (evt.target.readyState === FileReader.DONE) {
                let result = new Uint8Array(evt.target.result)
                result = new Zlib.RawInflate(result).decompress()
                let strResult = ''
                let length = result.length
                for (let i = 0; i < length; i++) {
                    strResult += String.fromCharCode(result[i])
                }
            callback(JSON.parse(strResult))
            }
        }
    }
}