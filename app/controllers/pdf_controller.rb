class PdfController < ApplicationController
  before_filter :authenticate_user!

  def index

    url = params["id"]
    pdf_params = { id: url }.to_param
    @pdf_url = url
    @pdf_name = params["name"]
    # puts pdf_url

    render :layout => false
  end

end
