require 'net/http'
require "cgi"

class Api::RenderingsController < ApplicationController
	before_filter :user_not_there!

  def show
    @job = Job.find(params[:job_id])
    return render_no_permission if !@job

    if @job && (user.is_my_job(@job) || user.is_shared_job(@job, 0b100000))
      puts "Inside"
      hash = CGI.escape(@job.airtables_project_hash)
      url = URI.parse("http://construction-vr.shaneburkhart.com/api/project/#{URI.escape(hash)}/renderings")
      req = Net::HTTP::Get.new(url.to_s)
      res = Net::HTTP.start(url.host, url.port) { |http| http.request(req) }

      render json: res.body
    else
      return render_no_permission
    end
  end

end
