#!/bin/bash
# Helps give us an idea of how quickly we're saving unique pages.
# Run with `watch -n 60 ./stats.sh`
echo "$(date --iso-8601=seconds) - $(ls forum.halomaps.org/ | wc -l)" | tee --append stats.txt
