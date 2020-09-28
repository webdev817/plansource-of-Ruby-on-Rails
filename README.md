# Welcome to PlanSource

Included in the page are details on how to run the project and how to submit work.

This project is used by an architect firm internally.  They use this app to manage all documents on a new construction project.  They primarily build apartment buildings.

Jobs are construction projects that they are working on.  Each job can be shared with other people.  Each tab in a job can be shared as well.  Tabs can be turned on and off from sharing.

In each job, there are tabs.  Each tab is a type of plan document.  Some tabs have different layouts than others.

Each row of a tab is typically a Plan.  Some tabs have different data structures like RFI/ASI tab.  A plan row has a name and can upload a file to the row.  Each time a file is uploaded, the old file is moved to history and new file is set to current.  This way all files and version are easy to find in one place.

Users can subscribe to updates to files in a tab.  They get an email when a new file is uploaded so they know to go download it.

## Overview

I've set it up so everything runs in Docker. Ideally, you don't need anything installed on your development environment except Docker.  I do my development this way so I know it's possible.  It's okay if you don't want to develop this way, but ultimately, the Docker pathway needs to work because that's how the project is deployed to production.

We use docker-compose to orchestrate containers and connect them and Makefile to run sets of commands for common tasks.  Below explains common tasks.

There are docker and docker-compose files for development and production.  Those files can be found in deploy/ directory.

## First Run

When you haven't ran the project before here are the steps to get set up.

```
# clone git repo
# add user.env to the root
make build
make npm_install
make db # rerun if it fails.  Typically takes a min to init pg
make run
```

To see errors, check the logs.

```
make logs
```

To see running containers.

```
make ps
```

## Building Docker

There are 3 Dockerfile that are built.  A base file in the root of the project that both dev and prod inherit from. You don't need to worry about which container to use because that's already set up in docker-compose.  Simply run `make build` to build images.

```
make build
```

## Start the App

Starting the app is simple.  All you need to do is run `make run`.

```
make run
```

## Stop the App

When you want to stop the app, you run `make clean`. This stops the docker containers and removes them completely.  Don't worry, data is saved to a volume mapped to the data/ directory.  This includes things like the postgres database files.

```
make clean
```

## Rebuild the DB

It's frequently useful to wipe the database entirely and rebuild it.  This is easy with docker.  You simply need to run `make wipe`.

This command will stop the containers, delete the data/ directory, start containers, wait for postgres to initialize and then migrate the database and seed it.  The entire process takes less than a minute usually.

```
make wipe
```

## Migrating the DB

When you want to migrate the database because you've added a migration file, you run `make db`.  This will also seed the database but will fail if the database is already seeded because it can't add duplicate users.

```
make db
```

This will also seed the db with users.  The seed file pulls ENV vars from user.env to create admin user.

## Undoing a DB Migration

When you want to undo a previous migration, you run `make db_undo`

```
make db_undo
```

## Accessing bin/bash Console

It's frequently useful to open the terminal that runs our web server.  You may want to open `rails c` for instance or investigate some file that isn't mapped as a volume.  All this command does is start a `web` container with the `/bin/bash` command.

```
make c
```

## Accessing Rails Console

Make changes using models.

```
make c_rails
```

## Accessing Postgres

Opens up a postgres console.

```
make pg
```

## Generating DB Migrations
```
make c
rails g migration this_is_a_migration
```

## Installing an NPM Dependency

Installing NPM dependencies is the same as long as you use `make c`.  When in the bash terminal for the container, you run your npm commands as usual.  The package.json is mapped to inside the container so all changes are persisted and node_modules installed.

### Install a new dependency
Start a bash console in a `websocket` container and add a dependency.

```
make c
npm install --save react
```

### NPM Install
Simply runs `npm install` with volumes mounted in `websocket` image.

```
make npm_install
```

### Clean NPM Install
Sometimes you want to do a fresh install.  This command removes `node_modules` and `package-lock.json`.

```
make clean_npm_install
```

## Following the Logs

Logs are useful and can be accessed for all containers using the `make logs` command.  This will tail all logs.  Sometimes the ordering is weird. I find if you ctrl-c out of the log tail, then run `make logs` again, it's fixed.  If the logs are too long, simply `make clean` and `make run` again to clear them.

```
make logs
```

## If you need a file inside a container

Most files that are frequently updated are mapped to the container via volumes.  Sometimes you want to grab a file that is not mapped.  To do this, we use the `docker cp` command.  Run `docker ps` to see the containers that are running. Add `-a` to see stopped containers as well.  Find the ID of the container you want to copy from and use `docker cp` command.

```
docker ps -a
# Copies file to current directory.
docker cp <container_id>:/app/file_to_copy.txt .
```

## Viewing Emails in Development

Emails are not sent in development.  Instead, a docker container called mailcatcher catches them.  You can view mailcatcher in the browser at `127.0.0.1:1080`.

## Git Workflow and Submitting Changes

I do not want you to commit to master.  I repeat, DO NOT COMMIT TO MASTER BRANCH.

Instead of committing to master, create your own branch referencing the issue you are working on.  All work to be done will be in Github issues.  When you decide to work on a particular issue, find the issue number and prefix that to your branch name.

So if you are working on issue 9 and it's to add paste from clipboard functionality then my branch might be named `9_shane_paste_from_clipboard`.

```
git checkout -b 9_shane_paste_from_clipboard
```

Push this branch as often as you want. When I need to review your work, I can simply checkout this branch and run the application the same as you. When we are ready to merge, we will use a pull request to master.

During the pull request phase, I'll do a quick code review if necessary and test any features that were added to make sure we got everything, then I will merge into master and deploy.

**Overview of Steps**
1. Pull master to make sure you are up-to-date
2. Create a branch for the issue you are working on
3. Commit and push changes to that branch.
4. Submit a pull request to merge to master in Github
5. Notify me that you are ready for me to review your pull request.
6. I'll review and go back and forth with you.
7. When we are satisfied, I will merge into master and deploy to production environment.

We may also add a staging deploy stage in there too.  Not necessary at the moment but it is easy to add to the process.
