class AdminController < ApplicationController
  before_filter :authenticate_user!
  before_filter :check_admin!

  def sub_logins
    @share_links = ShareLink.order("updated_at DESC").all
  end

  def delete_sub_login
    @share_link = ShareLink.find(params[:id])
    if !@share_link
        not_found
        return
    end

    @share_link.destroy
    if @share_link.destroyed?
        flash[:notice] = "Successfully deleted share link."
        redirect_to admin_sub_logins_path
    else
        flash[:error] = "There was a problem deleting the share link."
        redirect_to admin_sub_logins_path
    end
  end
end
