#!/bin/sh
# Builds the project with Docker. Run this from the project root.
docker build . \
    --tag halomaps \
    --file Dockerfile
