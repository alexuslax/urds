#!/bin/sh
set -eu

PORT="${PORT:-80}"

rm -f /etc/apache2/mods-enabled/mpm_event.load \
    /etc/apache2/mods-enabled/mpm_event.conf \
    /etc/apache2/mods-enabled/mpm_worker.load \
    /etc/apache2/mods-enabled/mpm_worker.conf

ln -sf ../mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
ln -sf ../mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

if grep -q "^Listen " /etc/apache2/ports.conf; then
    sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
else
    echo "Listen ${PORT}" >> /etc/apache2/ports.conf
fi

sed -i "s/<VirtualHost \*:[0-9][0-9]*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

echo "Apache ports.conf:"
cat /etc/apache2/ports.conf
echo "Enabled MPM modules:"
find /etc/apache2/mods-enabled -maxdepth 1 -type l -name 'mpm_*' -print
echo "Apache default vhost:"
cat /etc/apache2/sites-available/000-default.conf

apache2ctl -t
exec apache2-foreground
