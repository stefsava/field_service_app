require "test_helper"

class TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    post session_path, params: { email_address: @user.email_address, password: "password" }
  end

  test "should get index" do
    get tasks_url
    assert_response :success  # ✅ Evitiamo il redirect alla login
  end
end
