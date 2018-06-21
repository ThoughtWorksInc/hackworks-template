load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_dht.js');

let led = Cfg.get('pins.led');
let button = Cfg.get('pins.button');
let buttonTopic = '/devices/' + Cfg.get('device.id') + '/events/button';

let lightButton = 5;
let lightEnabled = true;
let lightTopic = '/devices/' + Cfg.get('device.id') + '/events/light';

let tempButton = 15;
let tempEnabled = false;
let tempTopic = '/devices/' + Cfg.get('device.id') + '/events/temp';
let humidityTopic = '/devices/' + Cfg.get('device.id') + '/events/humidity';

print('LED GPIO:', led, 'button GPIO:', button);

let getInfo = function () {
    return JSON.stringify({
        device_id: Cfg.get('device.id'),
        total_ram: Sys.total_ram(),
        free_ram: Sys.free_ram()
    });
};

// Blink built-in LED every second
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
Timer.set(1000 /* 1 sec */, Timer.REPEAT, function () {
    let value = GPIO.toggle(led);
}, null);

// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 20, function () {
    let message = getInfo();
    let ok = MQTT.pub(buttonTopic, message);
    print('Published:', ok, buttonTopic, '->', message);
}, null);

// Publish to MQTT topic when light present. Wired to GPIO pin 12
GPIO.set_button_handler(lightButton, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function () {
    if (lightEnabled) {
        let message = JSON.stringify({message: "lightDetected"});
        let ok = MQTT.pub(lightTopic, message);
        print('LIGHT Published:', ok, lightTopic, '->', message);
    }
}, null);

let dht = DHT.create(tempButton, DHT.DHT22);
// This function reads data from the DHT sensor every 5 seconds
Timer.set(5000 /* milliseconds */, Timer.REPEAT, function () {
    if (tempEnabled) {
        let t = dht.getTemp();
        let h = dht.getHumidity();

        if (isNaN(h) || isNaN(t)) {
            print('Failed to read data from temp sensor');
            return;
        }

        print('Temperature:', t, '*C');
        print('Humidity:', h, '%');
        let tempMessage = JSON.stringify({temp: t});
        let humMessage = JSON.stringify({humidity: h});

        let tok = MQTT.pub(tempTopic, tempMessage);
        print('TEMP Published:', tok, tempTopic, '->', tempMessage);

        let hok = MQTT.pub(humidityTopic, humMessage);
        print('HUMIDITY Published:', hok, humidityTopic, '->', humMessage);
    }

}, null);


MQTT.sub(buttonTopic, function (conn, message) {
    print('Got message:', message);
});

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function (ev, evdata, arg) {
    let evs = '???';
    if (ev === Net.STATUS_DISCONNECTED) {
        evs = 'DISCONNECTED';
    } else if (ev === Net.STATUS_CONNECTING) {
        evs = 'CONNECTING';
    } else if (ev === Net.STATUS_CONNECTED) {
        evs = 'CONNECTED';
    } else if (ev === Net.STATUS_GOT_IP) {
        evs = 'GOT_IP';
    }
    print('== Net event:', ev, evs);
}, null);
