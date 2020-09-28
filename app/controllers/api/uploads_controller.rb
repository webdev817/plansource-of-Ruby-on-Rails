require 'colorize'
class Api::UploadsController < ApplicationController
	before_filter :user_not_there!

  VALID_PHOTO_EXT = ['png', 'jpg', 'jpeg', 'tiff', 'gif']

  def presign
    # Create presigned URL
    filename = params["filename"]
    prefix = params["prefix"]
    s3 = AWS::S3.new
    uuid = SecureRandom.uuid
    redis_key = "#{prefix}:#{uuid}"
    aws_key = "#{prefix}/#{uuid}"
    original_filename = filename
    file_ext = original_filename.split('.').pop

    # Validate if needed
    if prefix == "photos"
      # Don't process image if not a valid file extension
      if !VALID_PHOTO_EXT.include?(file_ext)
        render json: { error: "Not a valid file extension." }
        return
      end
      aws_key = aws_key + "." + file_ext
      redis_key = redis_key + "." + file_ext
    end

    # Expire after an hour
    Redis.current.setex(redis_key, 60 * 60, original_filename)

    obj = s3.buckets[ENV["AWS_BUCKET"]].objects[aws_key];
    presigned_post = obj.presigned_post(
      key: aws_key,
      expires: 3600,
      success_action_status: 200,
    )
    render json: {
      url: presigned_post.url.to_s,
      fields: presigned_post.fields,
    }
  end

	private
	def user_not_there!
		render text: "No user signed in" unless user_signed_in? || User.find_by_authentication_token(params[:token])
	end
end
