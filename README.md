# socket.io


使用方法 demo<br>
import ws from '../../socket';<br>
按需订阅方法 ws.on(sub, callback)<br>
例子：ws.on(`{'event':'SUB','type':'ORDER_BOOK','product':'1001'}`, (data) => { })