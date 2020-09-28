class ContactSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :contact_id
  has_one :user, class_name: "User"
  has_one :contact, class_name: "User"
end
