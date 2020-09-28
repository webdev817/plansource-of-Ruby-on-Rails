# == Schema Information
#
# Table name: jobs
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
require "digest"

class Job < ActiveRecord::Base
  belongs_to :user

  has_one :project_manager_connection, class_name: "ProjectManager", foreign_key: "job_id"
  has_one :project_manager, through: :project_manager_connection
  has_one :shop_drawing_manager_connection, class_name: "ShopDrawingManager", foreign_key: "job_id"
  has_one :shop_drawing_manager, through: :shop_drawing_manager_connection

  has_many :plan_records
  has_many :plans
  has_many :shares
  has_many :shared_users, through: :shares, source: :user
  has_many :submittals, conditions: "is_accepted = false"
  has_many :photos
  has_many :rfis, class_name: "RFI", foreign_key: "job_id"
  has_many :unlinked_asis, class_name: "ASI", foreign_key: "job_id", conditions: "rfi_id IS NULL"

  attr_accessible :name, :user_id, :archived, :subscribed
  # Subscribed is not a db column
  attr_accessor :subscribed

  validates :user_id, presence: true
  validates :name, presence: true#, uniqueness: true
  validate :check_for_dubplicate_name_for_single_user

  before_destroy :destroy_plans
  before_destroy :destroy_shares

  # Blank and nil status goes last
  SHOPS_REPORTS_STATUS_ORDER = ["Pending", "Submitted", "Approved", "Approved as Corrected", "Revise & Resubmit", "Record Copy", ""]

  # Hash the id and the create_at.  Use as the key to send to ConstructionVR app
  # to get the render links and display them in a plans table.
  def airtables_project_hash
    Base64.encode64(Digest::SHA256.digest("#{self.id}__#{self.created_at}")).strip
  end

  # rendering json is done in two steps. as_json, then to_json.
  # This overrides as_json for a Job to include specified
  # non-persisting attributes.
  def as_json options=nil
    options ||= {}
    options[:methods] = ((options[:methods] || []) + [:subscribed])
    super options
  end

  def get_plans_for_tabs(tabs)
    self.plans.select{ |plan| tabs.include? plan.tab }
  end

  def get_plans_for_tabs_with_plan_num(tabs)
    plans = get_plans_for_tabs(tabs)

    current_plan_id = nil
    plans.each_with_index do |p, i|
      plans.each_with_index do |plan, j|

        if plan.previous_plan_id == current_plan_id
          plan.plan_num = i + 1
          current_plan_id = plan.id
          break
        end
      end
    end

    return plans.sort { |a, b| a.plan_num <=> b.plan_num  }
  end

  def send_message_to_group(message)
    shared_users.each do |shared_user|
      shared_user.send_message user.email, "This message is to the #{name} group:\n\n#{message}"
    end
  end

  def ordered_shop_drawings
    last_index = SHOPS_REPORTS_STATUS_ORDER.count

    return plans.where(tab: "Shops").sort do |a, b|
      # Default to last index if didn't find index
      aNum = SHOPS_REPORTS_STATUS_ORDER.find_index(a.status) || last_index
      bNum = SHOPS_REPORTS_STATUS_ORDER.find_index(b.status) || last_index
      next "#{aNum}#{a.csi}" <=> "#{bNum}#{b.csi}"
    end
  end

  def get_permissions_for_user(user)
    return shares.where(user_id: user.id).first.permissions
  end

  private

    def destroy_shares
      self.shares.each do |share|
        share.destroy
      end
    end

    def destroy_plans
      self.plans.each do |plan|
        plan.destroy
      end
    end

    def check_for_dubplicate_name_for_single_user
      j = Job.find_all_by_user_id_and_name(self.user_id, self.name)
      if j.count > 1 || (j.count == 1 && j.first.id != self.id) then
        errors.add(:name, 'already exists')
      end
    end
end
