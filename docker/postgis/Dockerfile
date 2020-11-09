FROM postgis/postgis:10-3.0-alpine

LABEL maintainer="WhereGroup <info@wheregroup.com>"
LABEL version="1.0"

ARG var_uid
ARG var_gid
ENV CURRENT_UID=$var_uid
ENV CURRENT_GID=$var_gid

RUN apk --update --no-cache add shadow \
    && usermod -u $CURRENT_UID  postgres \
    && groupmod -g $CURRENT_GID postgres \
    && chown -R postgres:postgres /var/lib/postgresql \
    && chown -R postgres:postgres /var/run/postgresql
