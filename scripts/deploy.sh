#!/bin bash
scp package.tar.gz dev@dumblev4.encs.concordia.ca:

ssh dev@dumblev4.encs.concordia.ca
cd /var/www/HackymonTCG
rm -rf *
tar xzf ~/package.tar.gz
chown -R dev: .

cd /var/www/HackymonTCG/bundle/programs/server
npm install --production

rm ~/package.tar.gz
logout

curl http://dumblev4.encs.concordia.ca