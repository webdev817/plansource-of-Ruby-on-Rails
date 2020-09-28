class Attachment < ActiveRecord::Base
  attr_accessible :filename, :s3_path, :submittal_id

  belongs_to :submittal

  validates :filename, :s3_path, :submittal_id, presence: true
end
