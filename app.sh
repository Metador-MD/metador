#!/usr/bin/env bash

STACK_NAME=metador

SCRIPT=$(readlink -f "$0")
ROOT_PATH=$(dirname "$SCRIPT")
ENV_FILE_PATH="${ROOT_PATH}/.env"
GREEN='\033[0;32m'
NC='\033[0m'

if [ "$#" -eq 1 ] && [[ "${1}" =~ ^(up|down)$ ]]; then
  # Create .env if not exists
  if [ ! -f "${ENV_FILE_PATH}" ]; then
    cd "${ROOT_PATH}" || exit
    echo "APP_ENV=dev" > .env

    # shellcheck disable=SC2059
    printf "\nCheck configuration in ${GREEN}${ENV_FILE_PATH}${NC} and run again.";
    exit 0
  fi

  COMPOSE_FILE="${ROOT_PATH}/docker-compose.yml"

  cd "${ROOT_PATH}" || exit

  # Change IP
  OLD_IP_ADDRESS="^IP_ADDRESS=.*$"
  NEW_IP_ADDRESS="IP_ADDRESS=$(ip -f inet addr show docker0 | sed -En -e 's/.*inet ([0-9.]+).*/\1/p')"

  if ! grep -q "IP_ADDRESS" "${ENV_FILE_PATH}"; then
    echo "${NEW_IP_ADDRESS}" >> "${ENV_FILE_PATH}"
  else
    sed -i "s/${OLD_IP_ADDRESS}/${NEW_IP_ADDRESS}/g" "${ENV_FILE_PATH}"
  fi

  if [[ ${1} == 'up' ]]; then
    docker-compose --project-name="${STACK_NAME}" --file="${COMPOSE_FILE}" up -d
  elif [[ ${1} == 'down' ]]; then
    docker-compose --project-name="${STACK_NAME}" --file="${COMPOSE_FILE}" down
  fi

  exit 0
fi

echo "Beispiele:"
echo "app.sh [up|down]"
