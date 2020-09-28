FROM ruby:2.3
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

RUN apt-get update && apt-get install -y curl
RUN apt-get install -y postgresql-client
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash -
RUN apt-get install nodejs

# Install dependencies for image exif parsing
RUN apt-get install -y libexif-dev

ENV RAILS_ENV production

RUN mkdir -p /app
WORKDIR /app

RUN mkdir tmp
ADD Gemfile Gemfile
RUN bundle install --without development test
RUN rm -r tmp

ADD package.json /app/package.json
RUN npm install

ADD . /app

RUN npm run-script build

EXPOSE 3000

CMD ["bundle", "exec", "rails", "s"]
