#! /bin/bash
xrdb -merge ~/.Xresources &


setxkbmap -option caps:escape

if [ -x /usr/bin/nm-applet];then
        nm-applet --sm-disable &
fi

.screenlayout/Dual-monitor.sh

~/.scripts/wallpaper

redshift &

exec i3
