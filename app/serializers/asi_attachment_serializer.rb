class ASIAttachmentSerializer < ActiveModel::Serializer
  attributes :id, :filename, :description, :s3_path
end

