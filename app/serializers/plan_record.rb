class PlanRecordSerializer < ActiveModel::Serializer
  attributes :id,
  :job_id,
  :plan_id,
  :plan_name,
  :plan_num,
  :filename,
  :aws_filename,
  :updated_at,
  :plan_record_file_name,
  :plan_record,
  :updated_at,
  :plan_record_content_type,
  :plan_record_file_size
  :plan_updated_at,
  :tab,
  :csi,
  :archived
end
