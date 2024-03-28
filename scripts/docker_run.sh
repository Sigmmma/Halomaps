#!/bin/sh
# Runs the project with Docker.
docker run \
    --publish 9000:9000 \
    --publish 9123:9123 \
    -detach \
    halomaps
