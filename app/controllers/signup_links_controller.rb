class SignupLinksController < ApplicationController
  before_filter :verify_signup_link_key

  def edit
    @user = @signup_link.user
    # Clear fields so the user can't accept what is there already.
    # We want to be able to reuse the edit view.
    # There might be a better way to do this.
    @user.first_name = nil
    @user.last_name = nil
    @user.company = nil
  end

  def update
    @user = @signup_link.user

    if @user.update_attributes user_params
      @user.signup_link.destroy
      sign_in @user
      redirect_to app_path
    else
      render :edit
    end
  end

  private
  def user_params
    @user_params = params[:user]
    return {
      first_name: @user_params[:first_name],
      last_name: @user_params[:last_name],
      company: @user_params[:company],
      password: @user_params[:password]
    }
  end

  def verify_signup_link_key
    @signup_link = SignupLink.find_by_key params[:key]
    if @signup_link
      sign_out current_user
    else
      redirect_to root_path
      # not_found
    end
  end
end
