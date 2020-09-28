class Api::PlansController < ApplicationController
	before_filter :user_not_there!, except: :download_share_link

	def show
		if user.can? :read, Plan
			@plan = Plan.find(params[:id])

			if user.is_my_plan(@plan) || user.is_shared_plan(@plan)
				render json: @plan
			else
				render_no_permission
			end
		else
			render_no_permission
		end
	end

	def create
		if user.can? :create, Plan
      @plan_params = params["plan"]
      # Clean this attr.  No idea why... but not changin' that ish
      @plan_params.delete("updated_at")

			@plan = Plan.new(@plan_params)

			if @plan.save
				render json: @plan
			else
				render json: {}
			end
		else
			render_no_permission
		end
	end

  # Simply update attributes of plan.  No reordering!
	def update
		if user.can? :update, Plan
			@plan = Plan.find(params[:id])
			@plan_params = params["plan"]
      @new_plan_num = @plan_params["plan_num"]
      @new_tab = @plan_params["tab"]

      if user.is_my_plan(@plan) or user.is_shop_drawing_manager(@plan.job)
				@plan.plan_name = @plan_params["plan_name"]
        @plan.csi = @plan_params["csi"]
				@plan.status = @plan_params["status"]
				@plan.code = @plan_params["code"]
				@plan.description = @plan_params["description"]
				@plan.tags = @plan_params["tags"]

        if !@plan_params["new_file_id"].blank? or !@plan_params["new_plan_link"].blank?
          if @plan.filename
            # Already got a plan, need to make plan file history
            pr = PlanRecord.new(
              plan_id: @plan.id,
              filename: @plan.filename,
              plan_updated_at: Time.now,
              plan_record_file_name: @plan.filename,
            )
            pr.plan_record = @plan.aws_filename
            pr.save
          elsif @plan.plan_link
            # Add old plan link to plan history.
            pr = PlanRecord.new(
              plan_id: @plan.id,
              plan_updated_at: Time.now,
              plan_link: @plan.plan_link,
            )
            pr.save
          end

          if !@plan_params["new_file_id"].blank?
            # Remove old links
            @plan.plan_link = nil

            s3 = AWS::S3.new
            file_id = @plan_params["new_file_id"]
            original_filename = @plan_params["new_file_original_filename"]
            aws_key = "plans/" + file_id
            obj = s3.buckets[ENV["AWS_BUCKET"]].objects[aws_key];
            obj.acl = :public_read

            @plan.plan = file_id
            @plan.filename = original_filename
          elsif !@plan_params["new_plan_link"].blank?
            # Remove old file
            @plan.plan = nil
            @plan.filename = nil

            @plan.plan_link = @plan_params["new_plan_link"]
          end
        end

        if user.is_my_plan(@plan) and @new_tab and @plan.tab != @new_tab
          # Remove plan from tab so tab list updates. Then switch to new tab.
          @plan.delete_plan_in_list
          @plan.tab = @new_tab
          # It's easiest and makes most sense to add to end of list. Since it's
          # not already in the new tab list, we can't use the current move function.
          # Once added, we can move as normal below.
          @plan.add_to_end_of_list
        end

				if @plan.save
          if !@plan_params["new_file_id"].blank? or !@plan_params["new_plan_link"].blank?
            Event.create(
              user_id: user.id,
              target_type: NOTIF_TARGET_TYPE[:plan],
              target_id: @plan.id,
              target_action: NOTIF_ACTIONS[:upload]
            )
          end

          if @new_plan_num.nil?
            # No need to update plan_num
            return render json: @plan
          end

          if @plan.move_to_plan_num(@new_plan_num.to_i)
            render json: @plan
          else
            render json: {}
          end
				else
					render json: {}
				end
			else
				render_no_permission
			end
		else
			render_no_permission
		end
	end

	def destroy
		@plan = Plan.find(params[:id])
		if user.can? :destroy, Plan
			if user.is_my_plan(@plan) or user.is_shop_drawing_manager(@plan.job)
				@plan.destroy
				render json: {}
			else
				render_no_permission
			end
		else
			if user.can_delete_plan
				@plan.destroy
				render json: {}
			else
				render_no_permission
			end
		end
	end

	def show_embedded
		if isRecord? params
			plan = PlanRecord.find(params[:id]).plan
		else
			plan = Plan.find(params[:id])
		end

		if (user && (user.is_my_plan(plan) || user.is_shared_plan(plan))) || (params[:share_token] && ShareLink.find_by_token_and_job_id(params[:share_token], plan.job_id))
			if isRecord? params
				@plan = PlanRecord.find(params[:id])
			else
				@plan = plan
			end
			render 'show_embedded', layout: false and return
		else
			flash[:warning] = "You don't have permission to do that"
			begin
				redirect_to(:back) and return
			rescue ActionController::RedirectBackError
				redirect_to root_path and return
			end
		end
	end

  def download_share_link
    @plan = Plan.where(download_token: params[:token]).first
    return render_no_permission if @plan.nil?
    if @plan.plan.nil?
      return render text: "No files have been uploaded to this link yet..."
    end

    path = @plan.plan.url

		if Rails.env.development?
      path = File.join(Rails.root, 'public', @plan.plan.url.split("?").first)
    end

    data = open(path)
    filename = "#{@plan.plan_name}-#{@plan.filename}"

		send_data data.read, {
      filename: filename,
      stream: 'true',
      buffer_size: '4096',
      disposition: "attachment; filename=\"#{filename}\""
    }
  end

	def plan_records
		@plan = Plan.find(params[:id])
    if user.is_my_plan(@plan) or user.is_shop_drawing_manager(@plan.job)
			render :json => PlanRecord.where(:plan_id => @plan.id).order("created_at DESC")
		elsif user.is_shared_plan(@plan)
			render :json => PlanRecord.where(:plan_id => @plan.id, :archived => false).order("created_at DESC")
		else
			render_no_permission
		end
	end

	private
	def isRecord? params
		return params[:type] == 'plan_record'
	end

end
