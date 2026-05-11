FROM php:8.2-apache

RUN rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf ../mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf ../mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && docker-php-ext-install mysqli

COPY . /var/www/html/

RUN a2enmod rewrite \
    && mkdir -p /var/www/html/uploads/proposals /var/www/html/uploads/announcements /var/www/html/uploads/profile_pictures \
    && chmod +x /var/www/html/docker-entrypoint.sh \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf ../mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf ../mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && chown -R www-data:www-data /var/www/html/uploads

EXPOSE 80

CMD ["/var/www/html/docker-entrypoint.sh"]
