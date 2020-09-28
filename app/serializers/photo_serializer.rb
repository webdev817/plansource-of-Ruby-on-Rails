class PhotoSerializer < ActiveModel::Serializer
  attributes :id, :description, :filename, :date_taken, :aws_filename, :original_url, :grid_url, :huge_url, :large_url, :thumbnail_url, :upload_user_id, :upload_user_email, :created_at
  has_one :upload_user
end
