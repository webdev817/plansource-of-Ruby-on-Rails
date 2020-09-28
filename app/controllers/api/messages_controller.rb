class Api::MessagesController < ApplicationController
  before_filter :user_not_there!

  def group
    @job = Job.find params[:job_id]
    if @job
      @job.send_message_to_group params[:message]
      render nothing: true
    else
      render nothing: true, status: 404
    end
  end
end
