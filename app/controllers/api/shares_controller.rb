class Api::SharesController < ApplicationController
  before_filter :user_not_there!, except: ["show"]
  before_filter :authenticate_user!, only: ["show"]

  def update
    if user.can? :update, Share
      @share = Share.find(params[:id])
      if user.id == @share.sharer_id
        @share.can_reshare = false;
        if @share.save
          render json: @share
        else
          render json: {error: "Something went wrong!"}
        end
      end
    else
      render_no_permission
    end
  end

  def destroy
    if user.can? :destroy, Job
      @share = Share.find(params[:id])
      if current_user.is_my_share @share
        @share.destroy
        render json: {}
      else
        render_no_permission
      end
    else
      render_no_permission
    end
  end

  def batch
    if(!params[:shares] || params[:shares].length < 1)
      render json: {}
      return
    end

    @job_id = params[:job_id]
    @current_shares = Share.where(job_id: @job_id)

    params[:shares].each do |i, new_share|
      share = Share.find_by_sharer_id_and_user_id_and_job_id(
        current_user.id,
        new_share[:user_id],
        @job_id
      )

      # Delete share if they were updated to have no permissions
      if !new_share[:permissions] || new_share[:permissions] == "0"
        share.destroy if share
        next
      end

      if share.nil?
        share = Share.create(
          sharer_id: current_user.id,
          user_id: new_share[:user_id],
          job_id: @job_id,
          can_reshare: false,
          permissions: new_share[:permissions]
        )

        user = User.find_by_id(new_share[:user_id])
        if user
          user.send_share_notification(share)
        end
      else
        share.permissions = new_share[:permissions]
        share.save
      end
    end

    render json: Share.where(job_id: @job_id)
  end

  private

    def user
      current_user || User.find_by_authentication_token(params[:token])
    end

    def user_not_there!
      render text: "No user signed in" unless user_signed_in? || User.find_by_authentication_token(params[:token])
    end

    def render_no_permission
      render :json => {error: "You don't have permission to do that"}
    end
end
