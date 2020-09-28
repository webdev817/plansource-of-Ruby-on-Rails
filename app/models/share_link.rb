class ShareLink < ActiveRecord::Base
    attr_accessible :job_id, :user_id, :email_shared_with

    belongs_to :user
    belongs_to :job

    validates :token, :job_id, :user_id, :email_shared_with, presence: true

    before_validation :create_token, :unless => Proc.new { |model| model.persisted? }

    private
        def create_token
            self.token= loop do
                random_token = SecureRandom.urlsafe_base64(20, false)
                break random_token unless ShareLink.exists?(token: random_token)
            end
        end
end
