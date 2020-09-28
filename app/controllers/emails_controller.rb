class EmailsController < ApplicationController
	def index
		downloader = DropboxDownloader.new

		@emails = downloader.get_files('').map { |path| EmlParser.new(path).parse }
		@attachments = downloader.get_files('').map { |path| EmlParser.new(path).attachment_parse }

		@emails.each do |item|

			
		end


	end

	def download
			download_file = "Envision LED-SLDSK-5-7-12.pdf"
			send_file(
				"#{Rails.root}/lib/attachment_temp/" + download_file,
				filename: download_file
			)
	end
end