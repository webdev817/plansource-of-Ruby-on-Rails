class ReportsController < ApplicationController
  before_filter :authenticate_user!

  SHOP_DRAWINGS_PERMISSION = 0b00010
  PLANS_PERMISSION = 0b00100

  def index
    render :index
  end

  # Form to selects jobs to show in RFI/ASI reports
  def rfi_asi_jobs
    # RFI/ASI (Plans) drawings permission
    @shared_jobs = get_active_shared_jobs_with_permissions(PLANS_PERMISSION)
    @jobs = user.jobs.where(archived: false) + @shared_jobs

    job_ids = @jobs.map{ |j| j.id }
    @assigned_user_ids = RFI.where(job_id: job_ids).where("assigned_user_id IS NOT NULL").pluck(:assigned_user_id)
    @assigned_user_ids += ASI.where(job_id: job_ids).where("assigned_user_id IS NOT NULL").pluck(:assigned_user_id)

    @assigned_users = User.where(id: @assigned_user_ids)

    render :rfi_asi_jobs
  end

  def rfi_asis
    @job_ids = params["job_ids"] || []
    @statuses = params["statuses"] || []
    @assigned_user_ids = params["assigned_user_ids"] || []

    if @job_ids.empty? or @statuses.empty? or @assigned_user_ids.empty?
      return redirect_to rfi_asis_report_jobs_path
    end

    @jobs = Job.where(id: @job_ids, archived: false).select do |job|
      # Make sure is user's job or is shared with permissions
      next user.is_my_job(job) || user.is_shared_job(job, PLANS_PERMISSION)
    end

    render :rfi_asis
  end

  # Form to selects jobs to show in shop drawings reports
  def shop_drawing_jobs
    # Shop drawings permission
    @shared_jobs = get_active_shared_jobs_with_permissions(SHOP_DRAWINGS_PERMISSION)
    @jobs = user.jobs.where(archived: false) + @shared_jobs

    job_ids = @jobs.map{ |j| j.id }
    @assigned_user_ids = Plan.where(job_id: job_ids, tab: "Shops").where("assigned_user_id IS NOT NULL").pluck(:assigned_user_id)

    @assigned_users = User.where(id: @assigned_user_ids)

    render :shop_drawing_jobs
  end

  # Shows shop drawing reports for jobs.
  def shop_drawings
    @job_ids = params["job_ids"] || []
    @statuses = params["statuses"] || []
    @assigned_user_ids = params["assigned_user_ids"] || []

    if @job_ids.empty? or @statuses.empty? or @assigned_user_ids.empty?
      # We need job ids and statuses for the report
      return redirect_to shop_drawings_report_jobs_path
    end

    @jobs = Job.where(id: @job_ids, archived: false).select do |job|
      # Make sure is user's job or is shared with permissions
      next user.is_my_job(job) || user.is_shared_job(job, SHOP_DRAWINGS_PERMISSION)
    end

    render :shop_drawings
  end

  private
    def get_active_shared_jobs_with_permissions(permissions)
      shared_jobs = user.shared_jobs.where(archived: false)

      jobs_with_permissions = shared_jobs.select do |job|
        next user.is_shared_job(job, permissions)
      end

      return jobs_with_permissions || []
    end
end
