require 'securerandom'
require "aws-sdk"

class Api::RFIsController < ApplicationController
	before_filter :user_not_there!

  def create
    if user.can? :create, RFI
      @rfi = RFI.new(
        subject: params["rfi"]["subject"],
        notes: params["rfi"]["notes"],
        job_id: params["rfi"]["job_id"],
        user_id: user.id,
      )
      attachments = params["rfi"]["updated_attachments"] || {}

      if !@rfi.save
        return render json: {}
      end

      attachments.each do |i, a|
        upload_id = a["upload_id"]
        filename = Redis.current.get("attachments:#{upload_id}")

        attachment = RFIAttachment.create(
          filename: filename,
          s3_path: "attachments/#{upload_id}",
          rfi_id: @rfi.id,
        )
      end

      # Reload for includes
      @rfi = RFI.includes(:asi, :attachments).find(@rfi.id)

      # Send RFI submitted nofification to job owner and RFI (Project) manager.
      # If they aren't the current user.
      job_owner = @rfi.job.user
      if job_owner != current_user
        RFIMailer.rfi_submitted(job_owner, @rfi).deliver
      end

      job_rfi_manager = @rfi.job.project_manager
      if job_rfi_manager != current_user
        RFIMailer.rfi_submitted(job_rfi_manager, @rfi).deliver
      end

      render json: @rfi
    else
      render_no_permission
    end
  end

  def update
    @rfi_params = params[:rfi]
    @rfi = RFI.find(params[:id])
    @job = @rfi.job

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)
    is_rfi_owner = user.id === @rfi.user_id

    # Check if current user is...
    # job owner, job project manager, or rfi owner
    if is_job_owner or is_job_pm or is_rfi_owner
      @rfi.notes = @rfi_params["notes"]
      @rfi.subject = @rfi_params["subject"]
      @rfi.due_date = @rfi_params["due_date"]

      if !@rfi.save
        return render json: {}
      end

      # Reload for includes
      @rfi = RFI.includes(:asi, :attachments).find(@rfi.id)

      render json: @rfi
    else
      render_no_permission
    end
  end

  def destroy
    @rfi = RFI.find(params[:id])
    @job = @rfi.job

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)

    if is_job_owner or is_job_pm
      @rfi.destroy
      render json: @rfi
    else
      render_no_permission
    end
  end

  def assign
    @rfi = RFI.find(params[:id])
    @job = @rfi.job
    @user = User.find(params["assign_to_user_id"])

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)

    # Make sure is owner or is PM and that the assigned user is shared
    # with Plans tab.
    if (is_job_owner or is_job_pm) and User.eligible_rfi_assignees.include? @user
      @rfi.assigned_user_id = @user.id

      if !@rfi.save
        return render json: {}
      end

      # Send RFI assigned to nofification to job owner, if they aren't the current user.
      if @rfi.job.user != current_user
        RFIMailer.rfi_asi_assigned_owner_notification(@user, @rfi).deliver
      end

      # Send notification to assignee, if they aren't the current user.
      if @user != current_user
        RFIMailer.rfi_asi_assigned(@user, @rfi).deliver
      end

      render json: @rfi
    else
      render_no_permission
    end
  end

  def download_attachment
    @attachment = RFIAttachment.find(params[:id])

    if @attachment
      s3 = AWS::S3.new
      obj = s3.buckets[ENV["AWS_BUCKET"]].objects[@attachment.s3_path];

      send_data obj.read, filename: @attachment.filename, stream: 'true', buffer_size: '4096'
    else
      render_no_permission
    end
  end
end

