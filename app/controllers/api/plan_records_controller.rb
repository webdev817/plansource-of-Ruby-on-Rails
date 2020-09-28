class Api::PlanRecordsController < ApplicationController
  before_filter :user_not_there!

  def batch_update
    # if user.can? :update, plan
    updates = JSON.parse(params[:update])
    pr_ids = updates.keys
    plan_records = PlanRecord.find_all_by_id(pr_ids)
    plan_records.each_with_index do |record, index|
      if current_user.is_my_plan_record(record)
        record.archived = updates[record.id.to_s]
      else

      end
    end
    plan_records.map{|x| x.save}
    render :json => plan_records
  end
end
