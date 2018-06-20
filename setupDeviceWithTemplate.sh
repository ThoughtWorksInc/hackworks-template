#!/bin/bash

echo "Building...."
(cd demo-js/ && mos build ./ --platform esp8266)
echo "Flashing build zip..."
(cd demo-js/ && mos flash build/fw.zip)
echo "Setting up wifi..."
mos wifi twguest "<enter tw guest password here>"
echo "Setting up aws iot..."
mos aws-iot-setup --aws-region eu-west-2 --aws-iot-policy mos-default
