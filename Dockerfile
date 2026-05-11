FROM php:8.2-apache

RUN rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf ../mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf ../mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && docker-php-ext-install mysqli

COPY . /var/www/html/

RUN a2enmod rewrite \
    && printf '%s\n' \
        '<VirtualHost *:80>' \
        '    ServerAdmin webmaster@localhost' \
        '    DocumentRoot /var/www/html/URDS/public' \
        '    DirectoryIndex login.html index.html index.php' \
        '    Alias /backend /var/www/html/backend' \
        '    Alias /uploads /var/www/html/uploads' \
        '    Alias /components /var/www/html/components' \
        '    <Directory /var/www/html/URDS/public>' \
        '        Options Indexes FollowSymLinks' \
        '        AllowOverride All' \
        '        Require all granted' \
        '    </Directory>' \
        '    <Directory /var/www/html/backend>' \
        '        Options FollowSymLinks' \
        '        AllowOverride None' \
        '        Require all granted' \
        '    </Directory>' \
        '    <Directory /var/www/html/uploads>' \
        '        Options FollowSymLinks' \
        '        AllowOverride None' \
        '        Require all granted' \
        '    </Directory>' \
        '    <Directory /var/www/html/components>' \
        '        Options FollowSymLinks' \
        '        AllowOverride None' \
        '        Require all granted' \
        '    </Directory>' \
        '    ErrorLog ${APACHE_LOG_DIR}/error.log' \
        '    CustomLog ${APACHE_LOG_DIR}/access.log combined' \
        '</VirtualHost>' \
        > /etc/apache2/sites-available/000-default.conf \
    && mkdir -p /var/www/html/uploads/proposals /var/www/html/uploads/announcements /var/www/html/uploads/profile_pictures \
    && chmod +x /var/www/html/docker-entrypoint.sh \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf ../mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf ../mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && chown -R www-data:www-data /var/www/html/uploads

EXPOSE 80

CMD ["/var/www/html/docker-entrypoint.sh"]
