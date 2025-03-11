require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one) # ✅ Carica un utente dalla fixture
    post session_path, params: { email_address: @user.email_address, password: "password" }
  end

  test "should get index" do
    get root_url
    assert_response :success  # ✅ Ora il test non sarà più reindirizzato
  end
end
