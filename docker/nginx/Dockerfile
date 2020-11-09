FROM nginx:1.17-alpine

LABEL maintainer="WhereGroup <info@wheregroup.com>"
LABEL version="1.0"

ARG var_uid
ARG var_gid
ENV CURRENT_UID=$var_uid
ENV CURRENT_GID=$var_gid

RUN apk --update --no-cache add shadow curl \
    && usermod -u $CURRENT_UID  nginx \
    && groupmod -g $CURRENT_GID nginx \
    && addgroup nginx tty \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

WORKDIR /var/www

USER nginx

EXPOSE 80

CMD ["nginx"]
