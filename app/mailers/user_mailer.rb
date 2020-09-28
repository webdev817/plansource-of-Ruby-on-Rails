class UserMailer < ActionMailer::Base
  include SendGrid
  default from: "PlanSource <plansource-noreply@plansource.io>"

  def share_notification(share)
    @share = share
    @email = share.sharer.email
    signup_link_model = SignupLink.find_by_user_id @share.user.id
    if signup_link_model
      @signup_link = signup_link_model.link
    end
    @subject = "#{@email} has shared a job with you!"
    mail(to: @share.user.email, subject: @subject)
  end

  def submittal_notification(submittal)
    @submittal = submittal
    @to = @submittal.job.user.email
    @subject = "New submittal for #{@submittal.job.name}"
    mail(to: @to, subject: @subject)
  end

  def share_link_notification(share_link, job, current_user)
    @link = "http://plansource.io/jobs/#{job.id}/share?share_link_token=#{share_link.token}"
    @job_name = job.name
    @subject = "#{current_user.email} shared a link to #{@job_name}!"
    mail(to: share_link.email_shared_with, subject: @subject)
  end

  def guest_user_notification(user, inviter_email)
    @user = user
    @signup_link = @user.signup_link.link
    @inviter_email = inviter_email
    @subject = "#{@inviter_email} has added you as a contact!"
    mail(to: @user.email, subject: @subject)
  end

  def arbitrary_message(from, user, message)
    @message = message
    @user = user
    @to = user.email
    @from = from
    @subject = "You have a message from #{@from}."
    @body = [
      "You have a new message from #{@from}:",
      "\n\n",
      @message
    ].join ""

    mail(to: @to, subject: @subject, body: @body, content_type: "text/plain")
  end
end
