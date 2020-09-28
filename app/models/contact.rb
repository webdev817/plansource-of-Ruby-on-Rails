class Contact < ActiveRecord::Base
  attr_accessible :user_id, :contact_id
  belongs_to :user, class_name: "User"
  belongs_to :contact, class_name: "User"
end
