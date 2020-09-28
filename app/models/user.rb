# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string(255)      default(""), not null
#  encrypted_password     :string(255)      default("")
#  reset_password_token   :string(255)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0)
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  first_name             :string(255)
#  last_name              :string(255)
#  confirmation_token     :string(255)
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string(255)
#  invitation_token       :string(60)
#  invitation_sent_at     :datetime
#  invitation_accepted_at :datetime
#  invitation_limit       :integer
#  invited_by_id          :integer
#  invited_by_type        :string(255)
#  type                   :string(255)
#  authentication_token   :string(255)
#

class User < ActiveRecord::Base

  has_many :jobs
  has_many :shares
  has_many :shared_jobs, through: :shares, source: :job
  has_many :user_contact_connection, class_name: "Contact", foreign_key: "user_id"
  has_many :contacts, through: :user_contact_connection
  has_one :signup_link
  has_many :events
  has_many :notification_subscriptions
  has_many :submitted_rfis, class_name: "RFI", foreign_key: "user_id"
  has_many :assigned_rfis, class_name: "RFI", foreign_key: "assigned_user_id"

  # Include default devise modules. Others available are:
  # , :confirmable,
  # :lockable, :timeoutable and :omniauthable :confirmable,:invitable,
  # :token_authenticatable
  devise :database_authenticatable, :registerable,
         :recoverable, :trackable, :validatable, :rememberable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :first_name, :last_name, :email, :password, :can_share_link, :can_delete_plan,
   :password_confirmation, :remember_me, :guest, :company, :authentication_token, :show_in_rfi_manager_list, :show_in_assign_rfi_list, :show_in_shops_manager_list, :show_in_assign_shops_list


  validates :authentication_token, :first_name, :last_name, :company, presence: true
  validate :check_type

  before_destroy :destroy_photo_uploads
  before_destroy :destroy_shares
  before_destroy :destroy_jobs

  before_validation :generate_token
  before_validation :ensure_type

  delegate :can?, :cannot?, :to => :ability

  def clear_reset_password_token
    self.update_column(:reset_password_token, nil)
    self.update_column(:reset_password_sent_at, nil)
  end

  def ability
    @ability ||= Ability.new(self)
  end

  def self.sorted_by(sort_attr)
    if sort_attr == "created_at" || sort_attr == "last_seen"
      @users = User.order "#{sort_attr} DESC"
    elsif sort_attr == "company"
      @users = User.all.sort { |x, y| x.company.downcase <=> y.company.downcase }
    elsif sort_attr == "name"
      @users = User.all.sort { |x, y| x.full_name.downcase <=> y.full_name.downcase }
    elsif sort_attr == "email"
      @users = User.all.sort { |x, y|
        x.email.downcase.split("@").reverse.join("") <=> y.email.downcase.split("@").reverse.join("")
      }
    else
      @users = User.all.sort_by { |x| 3 - x.sort_param }
    end
  end

  def self.eligible_project_managers
    User.where(show_in_rfi_manager_list: true).to_a
  end

  def self.eligible_shops_managers
    User.where(show_in_shops_manager_list: true).to_a
  end

  def self.eligible_rfi_assignees
    User.where(show_in_assign_rfi_list: true).to_a
  end

  def self.eligible_shops_assignees
    User.where(show_in_assign_shops_list: true).to_a
  end


  def self.find_or_create_new_guest_user(email, inviter_email)
    @user = User.find_by_email(email)
    if @user
	return @user
    end

    # Arbitrary password.  We will change it with signup_link.
    # It is needed to pass validation of model.
    pass = SecureRandom.urlsafe_base64(32)
    v = Viewer.new(first_name: "New", last_name: "User", email: email,
	password: pass, password_confirmation: pass)
    if !v.save
	return nil
    end
    v.create_signup_link

    UserMailer.guest_user_notification(v, inviter_email).deliver

    return v
  end

  def send_share_notification(share)
    UserMailer.share_notification(share).deliver
  end

  def send_message(from_email, message)
    UserMailer.arbitrary_message(from_email, self, message).deliver
  end

  def full_name
    "#{self.first_name} #{self.last_name}"
  end

  def manager?
  	self.class == Manager
  end

  def viewer?
  	self.class == Viewer
  end

  def admin?
    self.class == Admin
  end

  def has_type?
    return self.type == "Viewer" || self.type == "Manager"
  end

  def is_my_token(token)
    share = Share.find_by_token(token)
    return !share.nil? || is_my_share(share)
  end

  def can_share_job job
    return true if is_my_job job
    share = Share.find_by_job_id_and_user_id job.id, self.id
    return false if share.nil?
    return true if share.can_reshare
  end

  # Check if RFI or ASI is assigned to me
  def is_assigned_to_me(rfi_asi)
    assigned_user = rfi_asi.assigned_user

    # If is ASI and has RFI, then assigned_user is on RFI
    if rfi_asi.is_a?(ASI) and rfi_asi.rfi
      assigned_user = rfi_asi.rfi.assigned_user
    end

    return assigned_user && assigned_user.id == self.id
  end

  def is_project_manager(job)
    pm = job.project_manager
    return pm && pm.id == self.id
  end

  def is_shop_drawing_manager(job)
    sdm = job.shop_drawing_manager
    return sdm && sdm.id == self.id
  end

  def is_my_job(job)
    job.user.id == self.id
  end

  def is_my_plan(plan)
    is_my_job plan.job
  end

  def is_my_plan_record(plan_record)
    is_my_plan plan_record.plan
  end

  def is_my_share(share)
    is_being_shared(share) || is_my_job(share.job)
  end

  def is_being_shared(share)
    share.user.id == self.id
  end

  # Check that share has at least the given permissions.
  def is_shared_job(job, permissions=0)
    return true if job.user.id == self.id
    self.shares.each do |s|
      if s.job.id == job.id
        return (s.permissions & permissions) == permissions
      end
    end
    false
  end

  def is_shared_plan(plan)
    is_shared_job plan.job
  end

  def self.avatar_url email
    hash = Digest::MD5.hexdigest(email.strip)
    "http://www.gravatar.com/avatar/#{hash}?s=200&d=mm"
  end

  def expire # Account has expired so we will set expired flag to true
    if self.cancelled
      self.cancelled = false
      self.type = "Viewer"
    else
      self.expired = true
    end
    self.save
  end

  def sort_param
    return 0 if self.type.nil?
    return 1 if self.viewer?
    return 2 if self.manager?
    return 3 if self.admin?
    return 0
  end

  def get_subscriptions(params)
    return self.notification_subscriptions if params == nil
  end

  private

    def generate_token
      self.authentication_token = loop do
        random_token = SecureRandom.urlsafe_base64(nil, false)
        break random_token unless User.exists?(authentication_token: random_token)
      end
    end

    def destroy_photo_uploads
      # Change upload user on photo to VE user
      Photo.where("upload_user_id = ?", self.id).update_all(upload_user_id: 16)
    end

    def destroy_shares
      Share.where("user_id = ? OR sharer_id = ?", self.id, self.id).destroy_all
    end

    def destroy_jobs
      self.jobs.each do |job|
        job.destroy
      end
    end

    def ensure_type
      self.type = "Viewer" if self.type.nil?
    end

    def check_type
      errors.add(:type, 'Not a valid type') unless self.type == "Admin" || self.type == "Manager" || self.type == "Viewer"
    end
end
