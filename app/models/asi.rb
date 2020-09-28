class ASI < ActiveRecord::Base
  attr_accessible :asi_num, :status, :subject, :notes, :plan_sheets_affected, :in_addendum, :date_submitted, :job_id, :rfi_id, :user_id, :assigned_user_id

  STATUSES = ["Open", "Closed"]

  belongs_to :job
  belongs_to :user
  belongs_to :rfi, class_name: "RFI", foreign_key: "rfi_id"
  belongs_to :assigned_user, class_name: "User", foreign_key: "assigned_user_id"
  has_many :attachments, class_name: "ASIAttachment", foreign_key: "asi_id"

  validates :subject, :job_id, :user_id, presence: true
  validate :check_status

  before_save :generate_asi_num

  private

    def check_status
      if !STATUSES.include?(self.status)
        return errors.add(:status, "isn't a valid status")
      end
    end

    def generate_asi_num
      # If ASI is new and has asi_num, we are manually setting it
      return if self.new_record? and self.asi_num
      # If ASI is not new, we only update if date_submitted has changed
      return if !self.new_record? and !self.date_submitted_changed?

      date = DateTime.now

      # If there is a date_submitted, then we update asi_num based on that.
      # Otherwise, we use DateTime.now
      if self.date_submitted
        date = self.date_submitted
      end

      formatted_date = date.strftime("%y%m%d")

      asis = ASI.where(job_id: self.job_id)
      asi_num = formatted_date
      extension_num = 1

      loop do
        exists = asis.find { |asi| asi.asi_num == asi_num && asi.id != self.id }
        break if !exists

        extension = extension_num
        extension = "0#{extension_num}" if extension_num < 10

        asi_num = "#{formatted_date}-#{extension}"
        extension_num += 1
      end

      self.asi_num = asi_num
    end
end
