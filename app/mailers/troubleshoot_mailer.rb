class TroubleshootMailer < ActionMailer::Base
  include SendGrid
  default from: "PlanSource <plansource-noreply@plansource.io>"

  def issue_notification(user, message, attachments, url, user_agent)
    @user = user
    @message = message
    @attachments = attachments
    @url = url
    @user_agent = user_agent

    mail(to: ENV["TROUBLESHOOT_EMAIL"], subject: "[Issue] #{@user.email} submitted an issue!")
  end
end
