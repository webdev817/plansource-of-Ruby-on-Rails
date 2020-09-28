.PHONY: db

NAME=plansource
DEV_FILE=deploy/dev/docker-compose.yml
PROD_FILE=deploy/prod/docker-compose.yml

BASE_TAG=shaneburkhart/plansource

all: run

build:
	 docker build -t ${BASE_TAG} .
	 docker build -t ${BASE_TAG}:prod ./deploy/prod
	 docker build -t ${BASE_TAG}:dev ./deploy/dev

db_migrate:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web bundle exec rake db:migrate
 
db:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web bundle exec rake db:migrate
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web bundle exec rake db:seed

db_undo:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web rake db:rollback

run:
	docker-compose -f ${DEV_FILE} -p ${NAME} up -d

up:
	docker-machine start default
	docker-machine env
	eval $(docker-machine env)

stop:
	docker-compose -f ${DEV_FILE} -p ${NAME} stop

clean:
	docker-compose -f ${DEV_FILE} -p ${NAME} down

build_js:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web npm run-script build

npm_install:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web npm install

clean_npm_install:
	rm -rf node_modules
	rm -rf package-lock.json
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web npm install

wipe: clean
	rm -rf data
	$(MAKE) db || echo "\n\nDatabase needs a minute to start...\nWaiting 7 seconds for Postgres to start...\n\n"
	sleep 7
	$(MAKE) db

ps:
	docker-compose -f ${DEV_FILE} -p ${NAME} ps

c:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web /bin/bash

c_rails:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web rails c

pg:
	echo "Enter 'postgres'..."
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm pg psql -h pg -d mydb -U postgres --password


bundle:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web bundle

logs:
	docker-compose -f ${DEV_FILE} -p ${NAME} logs -f

########### PROD #################
prod_c:
	docker-compose -f ${PROD_FILE} -p ${NAME} run --rm web /bin/bash

prod_clean:
	docker-compose -f ${PROD_FILE} -p ${NAME} down || true
	docker-compose -f ${PROD_FILE} -p ${NAME} rm -f || true

prod_run:
	docker-compose -f ${PROD_FILE} -p ${NAME} up -d

prod_db:
	docker-compose -f ${PROD_FILE} -p ${NAME} run --rm web bundle exec rake db:migrate

prod:
	git checkout master
	git pull origin master
	$(MAKE) build
	$(MAKE) prod_clean
	$(MAKE) prod_run
	$(MAKE) prod_db
	$(MAKE) prod_run

digital_ocean_deploy:
	ssh -A root@161.35.101.100 "cd ~/PlanSource; make prod;"

restore_db_from_dump:
	docker-compose -f ${PROD_FILE} -p ${NAME} run -v $(shell pwd):/app web pg_restore --verbose --clean --no-acl --no-owner -h pg -U postgres -d mydb /app/latest.dump

heroku_db_to_digital_ocean:
	rm latest.dump || true
	$(MAKE) heroku_db_dump
	scp latest.dump root@161.35.101.100:~/PlanSource/latest.dump
	ssh -A root@161.35.101.100 "cd ~/PlanSource; git pull origin shane_digital_ocean; make restore_db_from_dump;"

heroku_db_dump:
	heroku pg:backups:capture
	heroku pg:backups:download

heroku_deploy:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web true
	rm Gemfile.lock || true
	docker cp $$(docker run -d ${BASE_TAG}:dev true):/app/Gemfile.lock .
	git add Gemfile.lock
	git commit -m "Added Gemfile.lock for Heroku deploy." || true
	git push -f heroku master
	heroku run --app plansource rake db:migrate
	heroku restart --app plansource
	rm Gemfile.lock
	git rm Gemfile.lock
	git commit -m "Removed Gemfile.lock from Heroku deploy."

heroku_staging_deploy:
	docker-compose -f ${DEV_FILE} -p ${NAME} run --rm web true
	rm Gemfile.lock
	docker cp $$(docker ps -a | grep web | head -n 1 | awk '{print $$1}'):/app/Gemfile.lock .
	git add Gemfile.lock
	git commit -m "Added Gemfile.lock for Heroku deploy."
	git push -f heroku_staging master
	heroku run --app plansourcestaging rake db:migrate
	heroku restart --app plansourcestaging
	rm Gemfile.lock
	git rm Gemfile.lock
	git commit -m "Removed Gemfile.lock from Heroku deploy."
