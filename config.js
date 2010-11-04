module.exports = {
    port: 3200,
    env: 'production',
    workers: 10,
    comment: 'yui-express',
    pidfile: '/tmp/yui-express.pid',
    accesslog: __dirname + '/logs/access.log'
}

