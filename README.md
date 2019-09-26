# socket.io


使用方法 demo
import ws from '../../socket';
按需订阅方法 ws.on(sub, callback)
例子：ws.on(`{'event':'SUB','type':'ORDER_BOOK','product':'1001'}`, (data) => { })