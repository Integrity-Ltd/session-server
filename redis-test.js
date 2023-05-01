import redis from 'redis';
const client = redis.createClient(6379, '127.0.0.1');
client.connect().then((replay) => {
    console.log('Connected!');
    client.set('framework', 'ReactJS').then((reply) => {
        console.log('Set data:' + reply); // OK
        client.get('framework').then((reply) => {
            console.log('Get data:' + reply);
            client.disconnect();
        });
    }).catch((err) => {
        console.log(err);
    })
})
