class NotificationPreview < ActionMailer::Base
  def self.update
    event = Event.last
    plan = event.get_object # Plan
    email_receip = NotificationSubscription.first
    # subscription = NotificationSubscription.first
    NotificationMailer.notification_email(event, plan, email_receip).deliver
  end
end
