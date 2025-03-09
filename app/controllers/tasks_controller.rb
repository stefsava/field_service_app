class TasksController < ApplicationController
  def index
    @tasks = fetch_tasks_from_odoo
  end

  private

  def fetch_tasks_from_odoo
    odoo = OdooClient.new
    user_id = Current.user.odoo_user_id # Associa l'utente Rails all'utente Odoo
    odoo.get_tasks(user_id)
  end
end
