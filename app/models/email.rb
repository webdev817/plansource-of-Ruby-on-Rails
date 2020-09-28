class Email < ActiveRecord::Base
  has_many :email_attachments
end