#!/bin/bash

ssh root@45.79.115.237 'bash -s'

docker pull ghcr.io/md9j/doctor-who/whodabase:latest
docker stop whodabase 
docker rm whodabase
docker run -d -p 3000:3000 --env-file /etc/doctorwhodabase/.env --name whodabase ghcr.io/md9j/doctor-who/whodabase:latest