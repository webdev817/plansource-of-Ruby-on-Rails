class RFIMailer < ActionMailer::Base
  include SendGrid
  default from: "PlanSource <plansource-noreply@plansource.io>"

  def rfi_submitted(user, rfi)
    return if user.nil? or rfi.nil?

    @rfi = rfi
    @subject = "An RFI Has Been Submitted"

    mail to: user.email, subject: @subject
  end

  def rfi_asi_closed(user, rfi_asi)
    return if user.nil? or rfi_asi.nil?
    @job = rfi_asi.job
    @rfi = rfi_asi.is_a?(RFI) ? rfi_asi : rfi_asi.rfi
    @asi = rfi_asi.is_a?(ASI) ? rfi_asi : rfi_asi.asi

    if @rfi.nil?
      @subject = "#{@job.name} - Closed ASI #{@asi.subject}"
    else
      @subject = "#{@job.name} - Closed RFI #{@rfi.subject} with ASI #{@asi.subject}"
    end

    mail to: user.email, subject: @subject, template_name: :rfi_asi_status_update
  end

  def rfi_asi_reopened(user, rfi_asi)
    return if user.nil? or rfi_asi.nil?
    @job = rfi_asi.job
    @rfi = rfi_asi.is_a?(RFI) ? rfi_asi : rfi_asi.rfi
    @asi = rfi_asi.is_a?(ASI) ? rfi_asi : rfi_asi.asi

    if @rfi.nil?
      @subject = "#{@job.name} - Re-Opened ASI #{@asi.subject}"
    else
      @subject = "#{@job.name} - Re-Opened RFI #{@rfi.subject} with ASI #{@asi.subject}"
    end

    mail to: user.email, subject: @subject, template_name: :rfi_asi_status_update
  end

  # rfi_asi could be either an RFI or ASI
  # We use in both ASI and RFI controllers
  def rfi_asi_assigned(assigned_user, rfi_asi)
    # When no @assigned_user, the email take the "you" form vs named.
    @job = rfi_asi.job
    @rfi = rfi_asi.is_a?(RFI) ? rfi_asi : rfi_asi.rfi
    @asi = rfi_asi.is_a?(ASI) ? rfi_asi : rfi_asi.asi

    if @rfi.nil?
      @subject = "An ASI Has Been Assigned to You"
    else
      @subject = "An RFI Has Been Assigned to You"
    end

    mail to: assigned_user.email, subject: @subject
  end

  # Notify owner of job that RFI or ASI is assigned.
  def rfi_asi_assigned_owner_notification(assigned_user, rfi_asi)
    @owner = rfi_asi.job.user
    @assigned_user = assigned_user
    @job = rfi_asi.job
    @rfi = rfi_asi.is_a?(RFI) ? rfi_asi : rfi_asi.rfi
    @asi = rfi_asi.is_a?(ASI) ? rfi_asi : rfi_asi.asi

    if @rfi.nil?
      @subject = "An ASI Has Been Assigned to #{@assigned_user.full_name}"
    else
      @subject = "An RFI Has Been Assigned to #{@assigned_user.full_name}"
    end

    mail to: @owner.email, subject: @subject, template_name: :rfi_asi_assigned
  end

end
