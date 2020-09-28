# This should be called "RFIManager" but I don't want to make the change.
class ProjectManager < ActiveRecord::Base
  attr_accessible :job_id, :user_id

  validates :job_id, :user_id, presence: true

  belongs_to :job
  belongs_to :project_manager, class_name: "User", foreign_key: "user_id"
end
