FROM php:8.2-apache

RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf \
    && docker-php-ext-install mysqli

COPY . /var/www/html/

RUN a2enmod rewrite \
    && mkdir -p /var/www/html/uploads/proposals /var/www/html/uploads/announcements /var/www/html/uploads/profile_pictures \
    && chown -R www-data:www-data /var/www/html/uploads

EXPOSE 80

CMD ["sh", "-c", "sed -i \"s/Listen 80/Listen ${PORT:-80}/\" /etc/apache2/ports.conf && sed -i \"s/<VirtualHost \\*:80>/<VirtualHost *:${PORT:-80}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
