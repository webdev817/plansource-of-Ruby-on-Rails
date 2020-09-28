class NotificationMailer < ActionMailer::Base
  include SendGrid
  default from: "PlanSource <plansource-noreply@plansource.io>"
  helper :verbage_helper

  def test_email(user)
    @user = user
    @url = 'localhost:3000'
    mail(to: User.first.email, subject: 'Test email')
  end

  def notification_email(event, job, sub)
    @event = event
    @job = job
    @sub = sub

    @plan = event.get_object
    @event_user = event.user
    @receip = sub.user

    subject = "[PlanSource] #{@job.name} - Notification #{@event.target_type.capitalize} #{@event.target_action.capitalize}"

    mail(to: @receip.email, subject: subject)
  end


end
