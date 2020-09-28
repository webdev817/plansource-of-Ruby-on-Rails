class PrintController < ApplicationController
	before_filter :user_not_there!

  def asi
    @asi = ASI.includes(:user, :assigned_user, :rfi).find(params[:id])
    @rfi = @asi.rfi
    @job = @asi.job

    # Check is owner or is shared job. RFI/ASI tab permissions.
    if !current_user.is_my_job(@job) and !current_user.is_shared_job(@job, 0b100)
      return not_found
    end

    render :asi
  end
end
