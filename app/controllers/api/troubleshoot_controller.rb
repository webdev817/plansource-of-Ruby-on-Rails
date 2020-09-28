require "aws-sdk"

class Api::TroubleshootController < ApplicationController
	before_filter :user_not_there!

  # Send a troubleshoot email with message and links to files.
  def create
    s3 = AWS::S3.new
    message = params["message"]
    attachment_ids = params["attachment_ids"] || []
    url = params["url"]
    user_agent = params["user_agent"]

    # Move files to troubleshooting bucket on submit
    # Set content disposition to download as filename
    attachments = attachment_ids.map do |id|
      filename = Redis.current.get("attachments:#{id}")

      srcObj = s3.buckets[ENV["AWS_BUCKET"]].objects["attachments/#{id}"];
      destObj = s3.buckets[ENV["AWS_BUCKET"]].objects["troubleshoot/#{id}"];

      destObj.copy_from(srcObj, {
        bucket: ENV["AWS_BUCKET"],
        acl: "public-read",
        content_disposition: filename,
      })

      # Remove old s3 object
      srcObj.delete

      next {
        id: id,
        filename: filename,
        url: "https://s3.amazonaws.com/#{ENV['AWS_BUCKET']}/troubleshoot/#{id}"
      }
    end

    TroubleshootMailer.issue_notification(user, message, attachments, url, user_agent).deliver

    render json: { success: true }
  end
end
