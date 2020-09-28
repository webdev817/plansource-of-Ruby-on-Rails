class PlanRecord < ActiveRecord::Base
  belongs_to :plan
  belongs_to :job

  attr_accessible :plan_id, :filename, :plan_updated_at, :plan_record_file_name, :archived, :plan_link

  def plan_record=(aws_filename)
    self.aws_filename = aws_filename
  end

  def plan_record
    aws_filename = self.aws_filename
    return nil unless self.aws_filename
    key_prefix = "plans"
    key_prefix = "plan_records" if self.is_legacy_aws_key

    p = {
      path: "#{key_prefix}/#{aws_filename}",
      url: "https://s3.amazonaws.com/#{ENV['AWS_BUCKET']}/#{key_prefix}/#{aws_filename}",
    }
    p.define_singleton_method(:path) { p[:path] }
    p.define_singleton_method(:url) { p[:url] }

    return p
  end
end
