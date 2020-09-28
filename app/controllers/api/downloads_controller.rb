class Api::DownloadsController < ApplicationController
	before_filter :user_not_there!

	def download
		begin
			if isPlanRecord?
				plan = PlanRecord.find(params[:id])
			else
				plan = Plan.find(params[:id])
			end
		rescue
			render :text => "No File Exists!!"
			return
		end

		# Make sure plan is shared with you
		if params[:share_token] && ShareLink.find_by_token_and_job_id(params[:share_token], plan.job_id) == nil
			flash[:warning] = "Please make sure you are signed in or the project is shared with you."
			redirect_to(:back) and return
		end

    if isPlanRecord?
      data = open(plan.plan_record.url)
    else
      data = open(plan.plan.url)
    end

		send_data data.read, filename: plan.filename, stream: 'true', buffer_size: '4096'
	end

	def embed
		begin
			if isPlanRecord?
				plan = PlanRecord.find(params[:id])
			else
				plan = Plan.find(params[:id])
			end
		rescue
			render :text => "No File Exists!!"
			return
		end

		# Make sure plan is shared with you
		if params[:share_token] && ShareLink.find_by_token_and_job_id(params[:share_token], plan.job_id) == nil
			flash[:warning] = "Please make sure you are signed in or the project is shared with you."
			redirect_to(:back) and return
		end

    if isPlanRecord?
      data = open(plan.plan_record.url)
    else
      data = open(plan.plan.url)
    end

		send_data data.read, filename: plan.filename, disposition: "inline"
	end

	private

		# TODO: Check out this method. Not really authenticating, just checking existance
    def user_not_there!
			unless user_signed_in? || User.find_by_authentication_token(params[:token]) || params[:share_token]
				flash[:warning] = "Please make sure you are signed in or the project is shared with you."
				redirect_to(:back) and return
			end
    end

    def isPlanRecord?
    	params[:type] == 'plan_record'
    end
end
