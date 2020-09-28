class UsersController < ApplicationController
  before_filter :authenticate_user!
  authorize_resource

  def index
    @s = params[:s] || "type"
    @r = params[:r] || false
    @users = User.sorted_by @s
    @users.reverse! if @r == "true"
  end

  def edit
    @user = User.find params[:id]
    @shared_jobs = @user.shared_jobs.order("created_at desc")
  end

  def update
    @user = User.find params[:id]
    @user.type = params[:user][:type]
    params[:user].delete :type

    if params[:user][:password].nil? or params[:user][:password].length <= 0
      params[:user].delete(:password)
    end

    if @user.update_attributes params[:user]
      redirect_to users_path
    else
      render :edit
    end
  end

  def destroy
    @user = User.find(params[:id])
    if @user
      @user.delete
      redirect_to users_path
    end
  end

  def batch_shares
    if(!params[:shared_jobs] || params[:shared_jobs].length < 1)
      return redirect_to users_path
    end

    user = User.find(params[:id])
    share_ids = params[:shared_jobs].keys.map(&:to_i)
    shares = user.shares.where(job_id: share_ids).index_by(&:job_id)
    ActiveRecord::Base.transaction do
      begin
        params[:shared_jobs].each do |job_id, values|
          if values[:is_shared]
            permissions_params = values.except(:is_shared).sort.reverse.to_h
            shares[job_id.to_i].update_attributes!(permissions: permissions_params.values.join.to_i(2))
          else
            shares[job_id.to_i].delete
          end
        end
        flash[:notice] = "Updated shared jobs successfully"
      rescue => e
        flash[:error] = e.message
      end
    end

    redirect_to users_path
  end

end
