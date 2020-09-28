# I regret calling this model notification subscription. It was because something
# with strip was named subscription and I didnt want to mess with anything remotely
# money related


class NotificationController < ApplicationController
  def unsubscribe
    result = NotificationSubscription.where(token: params[:id]).first
    result.destroy if !result.nil?
    render :json => "You are unsubscribed from notifications for this job."
  end
end
