FROM php:8.2-fpm-alpine

RUN set -eux; \
    apk add --no-cache \
      bash \
      curl \
      git \
      icu-dev \
      linux-headers \
      libjpeg-turbo-dev \
      libpng-dev \
      libwebp-dev \
      freetype-dev \
      libxml2-dev \
      libxslt-dev \
      libzip-dev \
      oniguruma-dev \
      unzip; \
    docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp; \
    docker-php-ext-install -j"$(nproc)" \
      bcmath \
      exif \
      ftp \
      gd \
      intl \
      mbstring \
      mysqli \
      opcache \
      pcntl \
      pdo_mysql \
      soap \
      sockets \
      xsl \
      zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY php.ini /usr/local/etc/php/conf.d/zz-magento.ini
COPY php-fpm-pool.conf /usr/local/etc/php-fpm.d/zz-magento-pool.conf

WORKDIR /var/www/html
