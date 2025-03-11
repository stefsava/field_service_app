class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :name, presence: true, uniqueness: true
  validates :email_address, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 8 }

  def self.authenticate(email_address, password)
    user = find_by(email_address: email_address)
    user&.authenticate(password)
  end
end
