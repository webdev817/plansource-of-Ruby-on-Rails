require 'securerandom'
require "aws-sdk"

class Api::ASIsController < ApplicationController
	before_filter :user_not_there!

  def create
    if user.can? :create, ASI
      @asi_params = params["asi"]
      @job = Job.find(@asi_params["job_id"])

      is_job_owner = user.is_my_job(@job)
      is_job_pm = user.is_project_manager(@job)

      # If creating unlinked asi, we check if is owner or is pm
      if !@asi_params["rfi_id"] and !(is_job_owner or is_job_pm)
        return render json: {}
      end

      # If creating linked asi, we check if is owner or is pm or is assigned
      if @asi_params["rfi_id"]
        @rfi = RFI.find(@asi_params["rfi_id"])
        is_assigned = user.is_assigned_to_me(@rfi)

        if !(is_job_owner or is_job_pm or is_assigned)
          return render json: {}
        end
      end

      @asi = ASI.new(
        status: "Open",
        plan_sheets_affected: @asi_params["plan_sheets_affected"],
        in_addendum: @asi_params["in_addendum"],
        subject: @asi_params["subject"],
        notes: @asi_params["notes"],
        job_id: @asi_params["job_id"],
        rfi_id: @asi_params["rfi_id"],
        user_id: user.id,
      )
      attachments = @asi_params["updated_attachments"] || {}

      if !@asi.save
        return render json: {}
      end

      attachments.each do |i, a|
        upload_id = a["upload_id"]
        filename = Redis.current.get("attachments:#{upload_id}")

        attachment = ASIAttachment.create(
          filename: filename,
          description: a["description"],
          s3_path: "attachments/#{upload_id}",
          asi_id: @asi.id,
        )
      end

      # Reload for includes
      @asi = ASI.includes(:attachments).find(@asi.id)

      render json: @asi
    else
      render_no_permission
    end
  end

  def update
    @asi_params = params[:asi]
    @asi = ASI.find(params[:id])
    @job = @asi.job

    is_status_update = @asi_params["status"] != @asi.status

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)
    is_assigned = user.is_assigned_to_me(@asi)

    # Check if current user is...
    # job owner, job project manager, or assigned to ASI
    if is_job_owner or is_job_pm or is_assigned
      @asi.notes = @asi_params["notes"]
      @asi.subject = @asi_params["subject"]
      @asi.plan_sheets_affected = @asi_params["plan_sheets_affected"]
      @asi.in_addendum = @asi_params["in_addendum"]
      @asi.date_submitted = @asi_params["date_submitted"]
      @asi.status = @asi_params["status"]

      if !@asi.save
        return render json: {}
      end

      if is_status_update
        # Notify submitter, Project Manager and Assigned To of new status
        submitter = @asi.rfi.nil? ? @asi.user : @asi.rfi.user
        project_manager = @job.project_manager
        assigned_to = @asi.rfi.nil? ? @asi.assigned_user : @asi.rfi.assigned_user

        [submitter, project_manager, assigned_to].compact.uniq{|x| x.email}.each do |user|
          if @asi.status == "Closed"
            RFIMailer.rfi_asi_closed(user, @asi).deliver
          else
            RFIMailer.rfi_asi_reopened(user, @asi).deliver
          end
        end
      end

      attachments = @asi_params["updated_attachments"] || {}

      # Remove attachments that no longer exist in updated list.
      @asi.attachments.each do |attachment|
        should_delete = !attachments.find do |i, a|
          next attachment.id == a['id'].to_i
        end

        attachment.destroy if should_delete
      end

      attachments.each do |i, a|
        id = a["id"]
        upload_id = a["upload_id"]

        if upload_id
          # New attachment
          filename = Redis.current.get("attachments:#{upload_id}")

          attachment = ASIAttachment.create(
            filename: filename,
            description: a["description"],
            s3_path: "attachments/#{upload_id}",
            asi_id: @asi.id,
          )
        else
          # Not a new attachment.  We are updating the description
          asiAttachment = ASIAttachment.find(id)
          asiAttachment.description = a["description"]
          asiAttachment.save
        end
      end

      # Reload for includes
      @asi = ASI.includes(:attachments).find(@asi.id)

      render json: @asi
    else
      render_no_permission
    end
  end

  def destroy
    @asi = ASI.find(params[:id])
    @job = @asi.job

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)

    if is_job_owner or is_job_pm
      @asi.destroy
      render json: @asi
    else
      render_no_permission
    end
  end

  def assign
    @asi = ASI.find(params[:id])
    @job = @asi.job
    @user = User.find(params["assign_to_user_id"])

    is_job_owner = user.is_my_job(@job)
    is_job_pm = user.is_project_manager(@job)

    # Make sure is owner or is PM and that the assigned user is shared
    # with Plans tab.
    if (is_job_owner or is_job_pm) and User.eligible_rfi_assignees.include? @user
      @asi.assigned_user_id = @user.id

      if !@asi.save
        return render json: {}
      end

      # Send ASI assigned to nofification to job owner, if they aren't the current user.
      if @asi.job.user != current_user
        RFIMailer.rfi_asi_assigned_owner_notification(@user, @asi).deliver
      end

      # Send notification to assignee, if they aren't the current user.
      if @user != current_user
        RFIMailer.rfi_asi_assigned(@user, @asi).deliver
      end

      render json: @asi
    else
      render_no_permission
    end
  end

  def download_attachment
    @attachment = ASIAttachment.find(params[:id])

    if @attachment
      s3 = AWS::S3.new
      obj = s3.buckets[ENV["AWS_BUCKET"]].objects[@attachment.s3_path];

      send_data obj.read, filename: @attachment.filename, stream: 'true', buffer_size: '4096'
    else
      render_no_permission
    end
  end
end

