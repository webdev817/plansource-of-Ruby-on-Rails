include Common

# NotificationSubscription.create(target_id:1, target_type:'job', user_id:1)
class NotificationSubscription < ActiveRecord::Base
  attr_accessible :target_action, :target_id, :target_type, :user_id
  belongs_to :user

  validates :target_id, :target_type, :user_id, :presence => true
  validates_presence_of :token, on: :before_create

  validates :target_action, uniqueness: { scope: [:target_type, :target_id, :user_id], message:"this user is already subscribed to this event's particular action"}
  before_save :sanitize_data
  before_validation :generate_token

  # Be aware of a user requesting no email notifications
  # Be aware of manager refusing notifications to a user


  def self.notify(event)
    # Exit if target action is not valid
    return if !NOTIF_ACTIONS_LIST.include?(event.target_action)

    # Find the job for the given event so we know who to notify.
    if event.target_type == NOTIF_TARGET_TYPE[:plan]
      job = Plan.find(event.target_id).job
    else
      job = Job.find(event.target_id)
    end

    # Can't do anything if we don't have a job.
    return if job.nil?

    # Send emails to all subscribers
    subs = NotificationSubscription.get_notifs_for_target(
      type: 'job',
      id: job.id
    ) || []
    subs.each do |sub|
      # If the event target is plan, need an additional check if a subscriber has a permission to the tab where the plan belongs to
      if event.target_type == NOTIF_TARGET_TYPE[:plan]
        is_subscribed = false
        plan = Plan.find(event.target_id)
        
        shares = sub.user.shares || []
        shares.each do |share|
          tab_bit = Plan::TAB_BITS[Plan::TABS.index(plan.tab)]
          is_subscribed = (share.permissions >> tab_bit) % 2 == 1
        end

        if is_subscribed
          NotificationMailer.notification_email(event, job, sub).deliver
        end
      else
        NotificationMailer.notification_email(event, job, sub).deliver
      end
    end
  end

  def self.user_is_subscribed(params)
    return false if !NOTIF_TARGET_TYPE_LIST.include?(params[:target_type])
    sub = NotificationSubscription.where(
      target_type: 'job',
      target_id: params[:target_id],
      user_id: params[:user_id]
    ).first

    return !sub.nil?
  end

  def self.get_notifs_for_target(params)
    if params[:user_id]
      NotificationSubscription.where(
        target_type: params[:type],
        target_id: params[:id],
        user_id: params[:user_id]
      )
    else
      NotificationSubscription.where(
        target_type: params[:type],
        target_id: params[:id]
      )
    end
  end

  def generate_token
    self.token = loop do
      random_token = SecureRandom.urlsafe_base64(10, false) # Length is 4/3 of n, see docs
      break random_token unless NotificationSubscription.exists?(token: random_token)
    end
  end

  private
  def sanitize_data
    self.target_type.downcase!
    self.target_action.downcase! if self.target_action.present?
  end


end
