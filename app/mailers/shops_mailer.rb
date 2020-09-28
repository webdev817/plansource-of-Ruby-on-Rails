class ShopsMailer < ActionMailer::Base
  include SendGrid
  default from: "PlanSource <plansource-noreply@plansource.io>"

  def submittal_submitted(user, submittal)
    return if user.nil? or submittal.nil?

    @submittal = submittal
    @subject = "A Shop Submittal Has Been Submitted"

    mail to: user.email, subject: @subject
  end

  def shop_assigned(assigned_user, shop)
    # When no @assigned_user, the email take the "you" form vs named.
    @job = shop.job
    @shop = shop
    @subject = "A Shop Drawing Has Been Assigned to You"

    mail to: assigned_user.email, subject: @subject
  end

  # Notify owner of job that RFI or ASI is assigned.
  def shop_assigned_owner_notification(assigned_user, shop)
    @owner = shop.job.user
    @assigned_user = assigned_user
    @job = shop.job
    @shop = shop
    @subject = "A Shop Drawing Has Been Assigned to #{@assigned_user.full_name}"

    mail to: @owner.email, subject: @subject, template_name: :shop_assigned
  end
end
