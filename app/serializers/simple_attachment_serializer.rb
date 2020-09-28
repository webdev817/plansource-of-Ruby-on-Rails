class SimpleAttachmentSerializer < ActiveModel::Serializer
  attributes :id, :filename, :s3_path
end
