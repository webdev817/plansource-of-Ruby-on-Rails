class HomeController < ApplicationController
  before_filter :go_to_app?

  def index
    @user = User.new
    @user.company = nil
  end
end
