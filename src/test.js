var { fork, exec } = require('child_process');
let worker = fork('./run.js');
worker.on('exit', () => {
    console.log('child progress exit');
});
//向子进程发送
worker.send({ hello: 'child' });
//监听子进程发来的信息
worker.on('message', (msg) => {
    console.log('from child', msg);
});
worker.on('error', (err) => {
    console.log(err);
    // This will be called with err being an AbortError if the controller aborts
});
