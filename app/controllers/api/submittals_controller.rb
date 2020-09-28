require 'securerandom'
require "aws-sdk"

class Api::SubmittalsController < ApplicationController
	before_filter :user_not_there!

  def index
    if user.can? :read, Submittal
      @submittals = Submittal.where(plan_id: params[:plan_id], is_accepted: true).includes(:user, :attachments).order("created_at DESC")

      render json: @submittals
    else
      render_no_permission
    end
  end

  def create
    if user.can? :create, Submittal
      @submittal = Submittal.new(
        data: params["submittal"]["data"],
        job_id: params["submittal"]["job_id"],
        user_id: user.id,
      )
      attachments = params["submittal"]["attachment_ids"] || []

      if !@submittal.save
        render json: {}
        return
      end

      attachments.each do |id|
        filename = Redis.current.get("attachments:#{id}")

        attachment = Attachment.create(
          filename: filename,
          s3_path: "attachments/#{id}",
          submittal_id: @submittal.id,
        )
      end

      # Reload for includes
      @submittal = Submittal.includes(:user, :attachments).find(@submittal.id)

      # Send Submittal submitted nofification to job owner and Shop Drawing manager.
      # If they aren't the current user.
      job_owner = @submittal.job.user
      if job_owner != current_user
        ShopsMailer.submittal_submitted(job_owner, @submittal).deliver
      end

      job_shop_drawing_manager = @submittal.job.shop_drawing_manager
      if job_shop_drawing_manager != current_user
        ShopsMailer.submittal_submitted(job_shop_drawing_manager, @submittal).deliver
      end

      render json: @submittal
    else
      render_no_permission
    end
  end

  def update
    if user.can? :update, Submittal
      @submittal = Submittal.find(params[:id])

      is_my_job = user.is_my_job(@submittal.job)
      is_job_sdm = user.is_shop_drawing_manager(@submittal.job)

      # Check if user can review submittals or is admin
      # Admins need to edit plans after they are accepted
      # Can Review Submittal users edit them to accept

      if user.admin? or is_my_job or is_job_sdm
        # Only update plan_id and is_accepted if not already accepted
        if !@submittal.is_accepted
          @submittal.plan_id = params["submittal"]["plan_id"];
          @submittal.is_accepted = params["submittal"]["is_accepted"];
        end
        @submittal.data = params["submittal"]["data"];

        if !@submittal.save
          render json: {}
          return
        end

        if @submittal.is_accepted
          # Update plan to have "Submitted" status when submittal is approved.
          @plan = @submittal.plan
          @plan.status = "Submitted"
          @plan.save
        end

        # Reload for includes
        @submittal = Submittal.includes(:user, :plan, :attachments).find(@submittal.id)

        render json: @submittal
      else
        render_no_permission
      end
    else
      render_no_permission
    end
  end

  def destroy
    if user.can? :destroy, Submittal
      @submittal = Submittal.find(params[:id])

      is_my_job = user.is_my_job(@submittal.job)
      is_job_sdm = user.is_shop_drawing_manager(@submittal.job)

      # Check if can review submittal or if the user is admin
      # There's a delete when reviewing and a delete after accepted for admin.
      if user.admin? or is_my_job or is_job_sdm
        @submittal.destroy
        render json: @submittal
      else
        render_no_permission
      end
    else
      render_no_permission
    end
  end

  def download_attachment
    @attachment = Attachment.find(params[:id])

    if @attachment
      s3 = AWS::S3.new
      obj = s3.buckets[ENV["AWS_BUCKET"]].objects[@attachment.s3_path];

      send_data obj.read, filename: @attachment.filename, stream: 'true', buffer_size: '4096'
    else
      render_no_permission
    end
  end
end
