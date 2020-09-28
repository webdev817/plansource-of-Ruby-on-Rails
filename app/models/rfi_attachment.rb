class RFIAttachment < ActiveRecord::Base
  attr_accessible :filename, :s3_path, :rfi_id

  belongs_to :rfi, class_name: "RFI", foreign_key: "rfi_id"

  validates :filename, :s3_path, :rfi_id, presence: true
end
