class ApplicationController < ActionController::Base
    #protect_from_forgery

    before_filter :last_seen

    rescue_from CanCan::AccessDenied do |exception|
      redirect_to root_path, :alert => exception.message
    end

    def not_found
	     raise ActionController::RoutingError.new('Not Found')
    end

    def go_to_app?
      redirect_to app_path if current_user
    end

    def after_sign_in_path_for(resource_or_scope)
	session[:user_return_to] || app_path
    end

    def user_not_there!
	     render text: "No user signed in" unless user_signed_in? || User.find_by_authentication_token(params[:token]) || params[:share_token]
    end

    def user
      current_user || User.find_by_authentication_token(params[:token])
    end

    def render_no_permission
      # This used to send test "You don't have permission" but empty braces
      # mean error in most cases. Sorry...
	    render json: {}
    end

    def check_admin!
      if !user.admin?
        not_found
      end
    end

    private
      def last_seen
        if user_signed_in?
          user.last_seen = Time.now
          user.save
        end
      end
end
