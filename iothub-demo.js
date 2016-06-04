'use strict';

var readConfig = require('read-config');

var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var config = readConfig('./config.json');

var connectionString = config.iotHubConnectionString;

var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
        client.on('message', function (msg) {
            client.complete(msg, printResultFor('completed'));
            //Body = msg.data = {"name":"cmd_takepic"}
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
            var cmd = JSON.parse(msg.data);
            console.log('cmd = ' + cmd.name);
            switch (msg.name) {
                case 'cmd_takepic':
                    break;
                case 'cmd_streaming':
                    break;
                case 'cmd_shutdown':
                    break;
            }
        });
        // Create a message and send it to the IoT Hub every second
        setInterval(function () {
            
            var windSpeed = 10 + (Math.random() * 4);
            var data = JSON.stringify({ deviceId: 'mydevice', windSpeed: windSpeed });
            var message = new Message(data);
            console.log("Sending message: " + message.getData());
            client.sendEvent(message, printResultFor('send'));
            
        }, 1000);
    }
};

client.open(connectCallback);