.PHONY: up down deploy

FTP_USER ?= najbergpis
FTP_URL ?= ftp://ftp.cluster027.hosting.ovh.net/lucky/
DEPLOY_FILES = index.html,script.js,styles.css,themes.css,cat.png

up:
	docker compose up


down:
	docker compose down

# Uploads the game files over FTP; curl asks for the password
deploy:
	curl --ssl -u $(FTP_USER) -T "www/{$(DEPLOY_FILES)}" $(FTP_URL)
