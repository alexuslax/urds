FROM php:8.2-apache

RUN docker-php-ext-install mysqli

COPY . /var/www/html/

RUN a2enmod rewrite \
    && mkdir -p /var/www/html/uploads/proposals /var/www/html/uploads/announcements /var/www/html/uploads/profile_pictures \
    && chown -R www-data:www-data /var/www/html/uploads

EXPOSE 80
