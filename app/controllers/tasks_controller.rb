class TasksController < ApplicationController
  before_action :require_login

  def index
    if Current.user&.odoo_user_id
      tasks = OdooClient.fetch_tasks(Current.user.odoo_user_id)
      render json: tasks
    else
      render json: { error: "Utente non collegato a Odoo" }, status: :unauthorized
    end
  end
end
