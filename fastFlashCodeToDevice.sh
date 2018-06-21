#!/usr/bin/env bash

WHITE="$(echo '\033[1;37m')"
WHITE_HIGHLIGHT="$(echo '\033[1;100;37m')"
NC="$(echo '\033[0m')" # No Color

SERIAL_PORT=$(ls /dev/cu* | grep -v Bluetooth | fzf --height=3 -1 -0 || { echo >&2 "${WHITE}No devices detected.${NC}"; exit 1; })

echo "${WHITE}>> transfering firmware to device${NC}"
~/.mos/bin/mos put fs/init.js --port "$SERIAL_PORT"

echo "${WHITE}>> All done. Restarting device...${NC}"
~/.mos/bin/mos call Sys.Reboot --port "$SERIAL_PORT"

echo "${WHITE}>> Connecting mos console. Press ${WHITE_HIGHLIGHT}control+C${WHITE} to exit${NC}"
~/.mos/bin/mos console --port "$SERIAL_PORT"
