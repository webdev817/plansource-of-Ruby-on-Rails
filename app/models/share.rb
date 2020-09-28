# == Schema Information
#
# Table name: shares
#
#  id          :integer          not null, primary key
#  user_id     :integer
#  job_id      :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  token       :string(255)
#  sharer_id   :integer
#  can_reshare :boolean          default(FALSE)
#

class Share < ActiveRecord::Base
	belongs_to :job
	belongs_to :user
  belongs_to :sharer, :class_name => "User", :foreign_key => "sharer_id"
  attr_accessible :job_id,
    :user_id, #invited user
    :sharer_id, #user sharing
  	:token,
    :can_reshare,
    :permissions
  #job.user is the inviter
  before_create :generate_token

  validates :token, uniqueness: true
  validates :job_id, :user_id, :sharer_id, :permissions, presence: true
  validates :permissions, numericality: { greater_than: 0 }
  validate :check_existance
  validate :check_share_with_owner

  private
    def check_share_with_owner
      job = Job.find self.job_id
      errors.add(:user_id, "Share already exists") if job.user.id == user_id
    end

    def check_existance
      Share.where(job_id: self.job_id, user_id: self.user_id).each do |share|
        errors.add(:job_id, 'Share already exists') if share.id != self.id
      end
  	end

	  def generate_token
	    self.token = loop do
	      random_token = SecureRandom.urlsafe_base64(nil, false)
	      break random_token unless Share.where(token: random_token).exists?
	    end
	  end

end
