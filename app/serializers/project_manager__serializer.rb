class ProjectManagerSerializer < ActiveModel::Serializer
  attributes :job_id, :user_id
  has_one :user
  has_one :contact
end
