class ShopDrawingManager < ActiveRecord::Base
  attr_accessible :job_id, :user_id

  validates :job_id, :user_id, presence: true

  belongs_to :job
  belongs_to :shop_drawing_manager, class_name: "User", foreign_key: "user_id"
end
