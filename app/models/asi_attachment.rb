class ASIAttachment < ActiveRecord::Base
  attr_accessible :filename, :description, :s3_path, :asi_id

  belongs_to :asi, class_name: "ASI", foreign_key: "asi_id"

  validates :filename, :s3_path, :asi_id, presence: true
end
