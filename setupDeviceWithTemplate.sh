#!/bin/bash

echo "Building...."
(mos build ./ --platform esp8266)
echo "Flashing build zip..."
(mos flash build/fw.zip)
echo "Setting up wifi..."
mos wifi twguest "<enter tw guest password here>"
echo "Setting up aws iot..."
mos aws-iot-setup --aws-region eu-west-2 --aws-iot-policy mos-default
