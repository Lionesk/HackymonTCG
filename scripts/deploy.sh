#!/bin bash
scp package.tar.gz travis@dumblev4.encs.concordia.ca:

ssh travis@dumblev4.encs.concordia.ca <<EOF
    mkdir -p /var/www/HackymonTCG/tmp
    cd /var/www/HackymonTCG/tmp
    tar xzf ~/package.tar.gz

    cp /var/www/HackymonTCG/bundle/Passengerfile.json /var/www/HackymonTCG/tmp/bundle/
    cd /var/www/HackymonTCG/tmp/bundle/programs/server
    npm install --production
    npm prune --production

    mv /var/www/HackymonTCG/bundle /var/www/HackymonTCG/bundle.old
    mv /var/www/HackymonTCG/tmp/bundle /var/www/HackymonTCG/bundle

    passenger-config restart-app /var/www/HackymonTCG/bundle

    rm -rf /var/www/HackymonTCG/bundle.old
    rm -rf /var/www/HackymonTCG/tmp
    rm ~/package.tar.gz
EOF
curl http://dumblev4.encs.concordia.ca