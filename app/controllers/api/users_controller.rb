class Api::UsersController < ApplicationController
  before_filter :user_not_there!

  def contacts
    render json: current_user.contacts
  end

  def add_contacts
    email = params[:contact][:email]
    if(current_user.email == email)
      render :json => {error: "You can't add yourself to your contacts."}
    else
      @user = User.find_or_create_new_guest_user(email, current_user.email);
      if(!@user)
        render json: { error: "Not a valid email." }
        return
      end

      @contact = Contact.find_by_user_id_and_contact_id(current_user.id, @user.id)
      if(!@contact)
        @contact = Contact.create(user_id: current_user.id, contact_id: @user.id)
        render json: @contact
      else
        render json: { error: "Contact already exists." }
      end
    end
  end

  # Anyone that has the job and tab shared with them is eligible to be a project manager.
  def eligible_project_managers
    @job = Job.find(params["id"])

    # Only owners can update project managers
    if current_user.is_my_job(@job) or current_user.is_project_manager(@job)
      eligible_users = User.eligible_project_managers

      render json: eligible_users, each_serializer: SimpleUserSerializer
    else
      render_no_permission
    end
  end

  # Anyone that has the job and tab shared with them is eligible to be a shop drawing manager.
  def eligible_shop_drawing_managers
    @job = Job.find(params["id"])

    # Only owners can update project managers
    if current_user.is_my_job(@job) or current_user.is_shop_drawing_manager(@job)
      eligible_users = User.eligible_shops_managers

      render json: eligible_users, each_serializer: SimpleUserSerializer
    else
      render_no_permission
    end
  end

  def eligible_rfi_assignees
    @job = Job.find(params["id"])

    # Only owners can update project managers
    if current_user.is_my_job(@job) or current_user.is_project_manager(@job)
      eligible_users = User.eligible_rfi_assignees

      render json: eligible_users, each_serializer: SimpleUserSerializer
    else
      render_no_permission
    end
  end

  def eligible_shops_assignees
    @job = Job.find(params["id"])

    # Only owners can update project managers
    if current_user.is_my_job(@job) or current_user.is_shop_drawing_manager(@job)
      eligible_users = User.eligible_shops_assignees

      render json: eligible_users, each_serializer: SimpleUserSerializer
    else
      render_no_permission
    end
  end
end
