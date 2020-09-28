FROM shaneburkhart/plansource
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

ENV RAILS_ENV production

RUN bundle exec rake assets:precompile

CMD ["bundle", "exec", "rails", "s"]
