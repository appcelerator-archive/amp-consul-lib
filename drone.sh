#!/bin/bash
#

set -ueo pipefail

export COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.drone.yml}
#export COMPOSE_PROJECT_NAME="drone_$(echo $DRONE_REPO |sed 's/[:/]/-/g')"
export COMPOSE_PROJECT_NAME="dronesut"

usage() {
  echo "usage:"
  echo "  $0 [--no-pull]"
}

opt_no_pull=0
while [ ! $# = 0 ]; do
  case "$1" in
  --no-pull)
    shift
    opt_no_pull=1
  ;;
  -h|--help)
    usage
    exit 0
    break
  ;;
  *)
    echo "invalid option:$1"
    usage
    exit 1
    break
  esac
done

function debug() {
  echo ">>>>>>>>>>> $@"
  "$@"
}

function cleanup {
  debug docker-compose kill
  debug docker-compose down --remove-orphans -v   #remove also orphans
  debug docker-compose rm --all -f -v             #faster
}

#ensure docker-compose clean-up
trap cleanup SIGINT SIGTERM EXIT
[ ! -z "${DOCKER_HUB_LOGIN:-}" ] && docker login -u "$DOCKER_HUB_LOGIN" -p "$DOCKER_HUB_PASSWORD" -e "$DOCKER_HUB_EMAIL"
cleanup
[ "$opt_no_pull" = "0" ] && debug docker-compose pull
debug docker-compose build
debug docker-compose run sut
