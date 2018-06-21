#!/bin/bash

SERIAL_PORT=$(ls /dev/cu* | grep -v Bluetooth | fzf --height=3 -1 -0 || { echo >&2 "${WHITE}No devices detected.${NC}"; exit 1; })

echo "Building...."
(~/.mos/bin/mos build ./ --platform esp8266 --port "$SERIAL_PORT")
echo "Flashing build zip..."
(~/.mos/bin/mos flash build/fw.zip --port "$SERIAL_PORT")
echo "Setting up wifi..."
~/.mos/bin/mos wifi twguest "<enter tw guest password here>" --port "$SERIAL_PORT"
echo "Setting up aws iot..."
~/.mos/bin/mos aws-iot-setup --aws-region eu-west-2 --aws-iot-policy mos-default --port "$SERIAL_PORT"
