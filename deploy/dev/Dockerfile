FROM shaneburkhart/plansource
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

ENV RAILS_ENV development

# Bundle caches the without calls so we delete the cache.
RUN rm /usr/local/bundle/config
RUN bundle install --without production test

# If we don't make sure assets are clean, then development assets won't
# automatically reload on change.
#RUN bundle exec rake assets:clean

# Mailcatcher port
EXPOSE 1025

CMD ["bundle", "exec", "rails", "s"]
