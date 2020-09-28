require 'securerandom'
require "aws-sdk"

class Api::PhotosController < ApplicationController
	before_filter :user_not_there!

  def show
    @job = Job.find(params[:job_id])

    if !@job
      return render_no_permission
    end

    if @job && (user.is_my_job(@job) || user.is_shared_job(@job, 0b10000))
      @photos = Photo.where(job_id: @job.id).includes(:upload_user)

      render json: @photos
    else
      return render_no_permission
    end
  end

  def update
    @photo = Photo.find(params[:id])

    # If we don't find the photo, then we can't check for the job
    if !@photo
      return render_no_permission
    end

    is_my_job = @photo.job.user_id == user.id
    is_my_photo = @photo.upload_user_id == user.id

    # Admins, job owner and the user that uploaded the photos can update
    if user.can?(:update, Photo) or is_my_job or is_my_photo
      @photo.description = params["photo"]["description"]

      if !@photo.save
        render json: {}
        return
      end

      render json: @photo
    else
      render_no_permission
    end
  end

  def destroy
    @photo = Photo.find(params[:id])

    # If we don't find the photo, then we can't check for the job
    if !@photo
      return render_no_permission
    end

    is_my_job = @photo.job.user_id == user.id
    is_my_photo = @photo.upload_user_id == user.id

    # Admins, job owner and the user that uploaded the photos can delete
    if user.can?(:destroy, Photo) or is_my_job or is_my_photo

      @photo.destroy
      render json: @photo
    else
      render_no_permission
    end
  end

  def submit_photos
    job = Job.find(params["job_id"])

    # I think the permissions passed to is_shared_job are photos permissions.
    # Should work on refactoring to constants, but client side needs constants too.
    if job && (user.is_my_job(job) || user.is_shared_job(job, 0b10000))
      photos = params["photos"] || []

      photos.each do |i, photo|
        aws_filename = photo["id"]
        filename = Redis.current.get("photos:#{aws_filename}")

        photo = Photo.create(
          filename: filename,
          date_taken: photo["date_taken"],
          aws_filename: aws_filename,
          job_id: job.id,
          upload_user_id: user.id,
        )
      end

      # Send notification to owner
      #UserMailer.submittal_notification(@submittal).deliver

      render json: { photos: job.photos }
    else
      render_no_permission
    end
  end

  def gallery
    @photo_id = params[:id]
    @photo = Photo.find(@photo_id)

    # If we don't find the photo, then we can't check for the job
    if !@photo
      return render_no_permission
    end

    is_my_job = user.is_my_job(@photo.job)

    # Make sure user can view this job.
    # I think the permissions passed to is_shared_job are photos permissions.
    # Should work on refactoring to constants, but client side needs constants too.
    if is_my_job || user.is_shared_job(@photo.job, 0b10000)
      # Query for after and before current photo.  200 each way.
      # Get results from the current photo, then switch order.
      photos_after = Photo.where(
        "job_id = ? AND date_taken >= ?",
        @photo.job_id,
        @photo.date_taken
      ).order('date_taken ASC, created_at ASC').limit(200).reverse
      # Don't query date_taken with less than or equals.  Just less than since
      # the above query handles equals. Then we can concat results.
      photos_before = Photo.where(
        "job_id = ? AND date_taken < ?",
        @photo.job_id,
        @photo.date_taken
      ).order('date_taken DESC, created_at DESC').limit(200)

      @photos_map = map_photos(photos_after.concat(photos_before))

      @photos_map.each_value do |photo|
        is_my_photo = photo[:upload_user_id] == user.id

        # Admins, job owner and the user that uploaded the photos can manage this photo
        can_manage_photo = user.can?(:update, Photo) || is_my_job || is_my_photo
        # Leaving edit and delete permissions separate under the assumption they
        # might not be the same in the future.
        photo["can_edit"] = can_manage_photo
        photo["can_delete"] = can_manage_photo
      end

      respond_to do |format|
        format.html { render :gallery, layout: false }
        format.json { render json: { photos: @photos_map } }
      end
    else
      return render_no_permission
    end
  end

  def download_photo
    @photo = Photo.find(params[:id])

    if @photo
      s3 = AWS::S3.new
      obj = s3.buckets[ENV["AWS_BUCKET"]].objects["photos/#{@photo.aws_filename}"];

      send_data obj.read, filename: @photo.filename, stream: 'true', buffer_size: '4096'
    else
      render_no_permission
    end
  end

  private

    def map_photos(ordered_photos)
      map_obj = {}

      ordered_photos.each_with_index do |photo, index|
        if !map_obj[photo.id]
          serializer = PhotoSerializer.new(photo, root: false)
          map_obj[photo.id] = serializer.as_json
        end

        # The photos are in decending order (newest first).
        # The "next" photo is taken before the current and vice versa for previous.
        if index + 1 < ordered_photos.count
          map_obj[photo.id]["next_photo_id"] = ordered_photos[index + 1].id
        end
        if index > 0
          map_obj[photo.id]["previous_photo_id"] = ordered_photos[index - 1].id
        end
      end

      return map_obj
    end

    def get_exif_data(file_path)
      begin
        return Exif::Data.new(File.new(file_path, 'r'))
      rescue StandardError => e
        puts e
        return nil
      end
    end
end
