@echo off
title Athena AI Desktop - Production Mode
set NODE_ENV=production
start npx electron electron-main.cjs
exit