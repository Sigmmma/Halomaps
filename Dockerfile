FROM alpine:latest

# Using Alpine, so we need to install everything we need.
RUN apk add --no-cache nodejs npm supervisor

# Download the pre-compiled database and user avatars.
# Do this early since this shouldn't change often (or ever).
WORKDIR /usr/src/downloads
ADD https://reclaimers-public-files.s3.amazonaws.com/halomaps/avatars.tar.gz avatars.tar.gz
ADD https://reclaimers-public-files.s3.amazonaws.com/halomaps/database.tar.gz database.tar.gz

# Extract pre-compiled resources to the appropriate locations.
WORKDIR /usr/src/
RUN mkdir -p halomaps/server/
RUN tar -xf downloads/database.tar.gz -C halomaps/server/
RUN mkdir -p halomaps/client/static
RUN tar -xf downloads/avatars.tar.gz -C halomaps/client/static/

# Remove archives to save space
RUN rm -r /usr/src/downloads

# Copy over npm config first. This lets us cache downloaded dependencies.
WORKDIR /usr/src/halomaps/server
COPY server/package*.json .
RUN npm ci

WORKDIR /usr/src/halomaps/client
COPY client/package*.json .
RUN npm ci

# Copy over relevant source files (see .dockerignore).
# These are most likely to change, so do this last.
WORKDIR /usr/src/halomaps
COPY server server
COPY client client
COPY supervisord.conf .

# Now run it all
ENTRYPOINT ["/usr/bin/supervisord", "-c", "supervisord.conf"]
