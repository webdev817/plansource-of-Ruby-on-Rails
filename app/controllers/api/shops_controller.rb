class Api::ShopsController < ApplicationController
	before_filter :user_not_there!

  def assign
    @shop = Plan.find(params[:id])
    @job = @shop.job
    @user = User.find(params["assign_to_user_id"])

    if @shop.tab != "Shops"
      return render_no_permission
    end

    is_job_owner = user.is_my_job(@job)
    is_job_sdm = user.is_shop_drawing_manager(@job)

    # Make sure is owner or is Shop Drawing Manager and that the assigned user
    # is shared with Shops tab.
    if (is_job_owner or is_job_sdm) and User.eligible_shops_assignees.include? @user
      @shop.assigned_user_id = @user.id

      if !@shop.save
        return render json: {}
      end

      # Send shop assigned nofification to job owner, if they aren't logged in.
      if @shop.job.user != current_user
        ShopsMailer.shop_assigned_owner_notification(@user, @shop).deliver
      end

      # Send notification to assignee, if they aren't the current user.
      if @user != current_user
        ShopsMailer.shop_assigned(@user, @shop).deliver
      end

      render json: @shop
    else
      render_no_permission
    end
  end

end
