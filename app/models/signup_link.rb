class SignupLink < ActiveRecord::Base
  attr_accessible :key, :user_id

  belongs_to :user

  validates :key, :user_id, presence: true

  before_validation :create_key, :unless => Proc.new { |model| model.persisted? }

  def link
    if Rails.env.development?
      host = "http://127.0.0.1"
    else
      host = "http://plansource.io"
    end
    "#{host}/users/signup_link/#{self.key}"
  end

  private

  def create_key
    self.key = loop do
      random_token = SecureRandom.urlsafe_base64(64, false)
      break random_token unless SignupLink.exists?(key: random_token)
    end
  end

end
