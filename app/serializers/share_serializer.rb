class ShareSerializer < ActiveModel::Serializer
  attributes :id, :can_reshare, :job_id, :permissions

  has_one :user
  has_one :sharer
end
