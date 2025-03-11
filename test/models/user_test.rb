require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "should not save user without email" do
    user = User.new(name: "Test User", password: "password123")
    assert_not user.save, "Saved the user without an email"
  end

  test "should not save user without password" do
    user = User.new(name: "Test User", email_address: "test@example.com")
    assert_not user.save, "Saved the user without a password"
  end

  test "should save valid user" do
    user = User.new(name: "Test User", email_address: "test@example.com", password: "password123")
    assert user.save, "Failed to save a valid user"
  end

  test "should not allow duplicate email" do
    existing_user = users(:one)  # Usa l'utente della fixture
    user = User.new(name: "Test User", email_address: existing_user.email_address, password: "password123")
    assert_not user.save, "Saved a user with a duplicate email"
  end

  test "should encrypt password on save" do
    user = User.create(name: "Test User", email_address: "test@example.com", password: "password123")

    # ✅ Verifica che password_digest NON sia uguale alla password in chiaro
    assert_not_equal "password123", user.password_digest, "Password should not be stored in plain text"

    # ✅ Verifica che la password sia valida tramite `.authenticate`
    assert user.authenticate("password123"), "User should authenticate with the correct password"

    # ✅ Verifica che una password errata NON funzioni
    assert_not user.authenticate("wrongpassword"), "User should not authenticate with a wrong password"
  end
end
