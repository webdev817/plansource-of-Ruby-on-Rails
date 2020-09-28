include Common

class Event < ActiveRecord::Base
  attr_accessible :target_action, :target_id, :target_type, :user_id
  belongs_to :user

  validates :target_action, :target_id, :target_type, :user_id, :presence => true
  validate :ensure_valid_target_type, :ensure_valid_target_action

  before_save :sanitize_data
  after_commit :notify_subscribers, :on => :create

  # Send logic to update users to NotificationSubscription
  def notify_subscribers
    NotificationSubscription.notify(self)
  end

  # NOTE make sure to sanitize class_name before using reflection.
  # Potentially dangerous
  def get_object
    class_name = self.target_type.classify
    klass = Object.const_get(class_name)
    return klass.find(self.target_id)
  end

  private
  def ensure_valid_target_type
    errors.add(:target_type, "target type is invalid") unless NOTIF_TARGET_TYPE_LIST.include? target_type
  end

  def ensure_valid_target_action
    errors.add(:target_action, "target action is not valid") unless NOTIF_ACTIONS_LIST.include? target_action
  end

  def sanitize_data
    self.target_type.downcase!
    self.target_action.downcase!
  end
end
